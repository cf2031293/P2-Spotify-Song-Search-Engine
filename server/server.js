const http = require('http');
const fs = require('fs');
const path = require('path');
const { runBackend } = require('./backend_bridge');

const PORT = process.env.PORT || 3001;
const projectRoot = path.resolve(__dirname, '..');
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_CACHE_MAX_ENTRIES = 40;
const searchCache = new Map();
let catalog = [];
let catalogLoadPromise = null;
let catalogReady = false;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function getFilteredResults(query = '', filters = []) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedFilters = [...filters].map((filter) => String(filter).toLowerCase()).sort();
  const cacheKey = JSON.stringify({ query: normalizedQuery, filters: normalizedFilters });
  const now = Date.now();

  const cached = searchCache.get(cacheKey);
  if (cached && now - cached.timestamp < SEARCH_CACHE_TTL_MS) {
    return cached.results;
  }

  let filteredResults;
  try {
    const songs = await ensureCatalogLoaded();
    filteredResults = songs.filter((song) => matchesQuery(song, normalizedQuery) && matchesFilters(song, normalizedFilters));
  } catch (catalogError) {
    const data = await runBackend(query, filters);
    filteredResults = (data.results || []).map((song) => mapSong(song));
  }

  if (searchCache.size >= SEARCH_CACHE_MAX_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) {
      searchCache.delete(oldestKey);
    }
  }

  searchCache.set(cacheKey, { timestamp: now, results: filteredResults });
  return filteredResults;
}

function mapSong(song) {
  return {
    title: song.title || song.trackName || song.name || '',
    artist: song.artist || song.artists || '',
    tempo: Number(song.tempo) || 0,
    energy: Number(song.energy) || 0,
    danceability: Number(song.danceability) || 0,
    acousticness: Number(song.acousticness) || 0,
    popularity: Number(song.popularity) || 0
  };
}

function matchesQuery(song, normalizedQuery) {
  if (!normalizedQuery) {
    return true;
  }

  return song.title.toLowerCase().includes(normalizedQuery) || song.artist.toLowerCase().includes(normalizedQuery);
}

function matchesFilters(song, normalizedFilters) {
  for (const filter of normalizedFilters) {
    if (filter === 'energy' && song.energy < 0.7) {
      return false;
    }

    if (filter === 'danceability' && song.danceability < 0.7) {
      return false;
    }

    if (filter === 'tempo' && song.tempo < 100) {
      return false;
    }

    if (filter === 'acousticness' && song.acousticness > 0.2) {
      return false;
    }
  }

  return true;
}

async function ensureCatalogLoaded() {
  if (catalogReady) {
    return catalog;
  }

  if (!catalogLoadPromise) {
    catalogLoadPromise = runBackend('', [])
      .then((data) => {
        catalog = (data.results || []).map((song) => mapSong(song));
        catalogReady = true;
        return catalog;
      })
      .catch((error) => {
        catalogLoadPromise = null;
        throw error;
      });
  }

  return catalogLoadPromise;
}

function paginateResults(results, page, limit) {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 50));
  const totalResults = results.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / safeLimit));
  const normalizedPage = Math.min(safePage, totalPages);
  const startIndex = (normalizedPage - 1) * safeLimit;

  return {
    page: normalizedPage,
    limit: safeLimit,
    totalResults,
    totalPages,
    results: results.slice(startIndex, startIndex + safeLimit)
  };
}

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.jsx': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url.startsWith('/api/search')) {
    const urlObj = new URL(url, `http://${req.headers.host || 'localhost'}`);
    const query = urlObj.searchParams.get('q') || '';
    const filters = urlObj.searchParams.getAll('filter');
    const page = urlObj.searchParams.get('page') || '1';
    const limit = urlObj.searchParams.get('limit') || '50';

    getFilteredResults(query, filters)
      .then((results) => {
        const paged = paginateResults(results, page, limit);
        sendJson(res, 200, {
          success: true,
          query,
          ...paged
        });
      })
      .catch((error) => {
        sendJson(res, 500, {
          success: false,
          error: error.message
        });
      });
    return;
  }

  let filePath = path.join(projectRoot, url === '/' ? 'index.html' : decodeURIComponent(url));

  if (!path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!filePath.startsWith(projectRoot)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.exists(filePath, (exists) => {
    if (!exists) {
      serveStaticFile(res, path.join(projectRoot, 'index.html'));
      return;
    }

    serveStaticFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Search API running at http://localhost:${PORT}`);
  void ensureCatalogLoaded()
    .then((songs) => {
      console.log(`Catalog preloaded in memory (${songs.length} songs)`);
    })
    .catch((error) => {
      console.warn(`Catalog preload failed; using direct backend fallback: ${error.message}`);
    });
});
