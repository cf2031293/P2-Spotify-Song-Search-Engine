import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, List, LayoutGrid, ArrowLeft, Music } from "lucide-react";

function AlbumArtPlaceholder({ size = "md", className = "" }) {
  const dims = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  return (
    <div
      className={`shrink-0 ${dims} rounded-md bg-[#C5BCE7] border border-[#2A2D3E] flex items-center justify-center text-[#5B5F72] ${className}`}
      aria-hidden="true"
    >
      <Music size={size === "sm" ? 16 : 20} />
    </div>
  );
}

const FILTERS = ["Energy", "Danceability", "Tempo", "Acousticness"];

export default function SongSearch({ onNavigate = () => {} }) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [view, setView] = useState("list");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const activeRequestRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    void fetchResults();

    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, []);

  const fetchResults = async (searchQuery = query, filters = activeFilters, requestedPage = 1) => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    const controller = new AbortController();
    activeRequestRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      filters.forEach((filter) => params.append("filter", filter));
      params.set("page", String(requestedPage));
      params.set("limit", "50");

      const response = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Search request failed");
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setResults(data.results || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || 0);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      console.error("Failed to load results", error);
      setResults([]);
      setPage(1);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const toggleFilter = (f) => {
    const nextFilters = activeFilters.includes(f)
      ? activeFilters.filter((x) => x !== f)
      : [...activeFilters, f];

    setActiveFilters(nextFilters);
    setPage(1);
    void fetchResults(query, nextFilters, 1);
  };

  const handleSearch = () => {
    setPage(1);
    void fetchResults(query, activeFilters, 1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setPage(nextPage);
    void fetchResults(query, activeFilters, nextPage);
  };

  const formatArtists = (artistValue = "") =>
    artistValue
      .split(";")
      .map((name) => name.trim())
      .filter(Boolean)
      .join(" & ");

  const getVisiblePages = () => {
    if (totalPages <= 1) {
      return [];
    }

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const pages = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen w-full bg-[#7D7ABC] flex justify-center px-6 py-16">
      <div className="w-full max-w-[860px] flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[#F3EFE6] text-[32px]">
            Song Search
          </h1>
          <button
            onClick={() => onNavigate("menu")}
            className="flex items-center gap-2 font-body text-sm text-[#C5BCE7] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D] rounded-sm px-2 py-1"
          >
            <ArrowLeft size={14} />
            Menu
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-3 flex-1 px-5 py-4 rounded-full border border-[#2A2D3E] bg-white focus-within:border-[#FF6A3D] transition-colors">
            <Search size={18} className="text-[#5B5F72] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a song name"
              className="bg-transparent outline-none w-full font-body text-[#5B5F72] text-base"
            />
          </div>
          <button
            onClick={handleSearch}
            className="shrink-0 rounded-[10px] bg-[#FFC067] px-8 font-display text-[#10121A] text-lg hover:bg-[#ff7d55] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3EFE6]"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        <div className="flex items-center justify-between relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-1 font-body font-semibold text-white text-base hover:text-[#FFC067] transition-colors focus:outline-none"
          >
            Filter
            <ChevronDown
              size={16}
              className={`transition-transform ${filterOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div className="flex items-center gap-1 rounded-full border border-[#2A2D3E] p-1">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-1.5 rounded-full transition-colors ${
                view === "list" ? "bg-[#C5BCE7] text-[#10121A]" : "text-[#5B5F72]"
              }`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded-full transition-colors ${
                view === "grid" ? "bg-[#C5BCE7] text-[#10121A]" : "text-[#5B5F72]"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {filterOpen && (
            <div className="absolute top-10 left-0 z-10 bg-white border border-[#2A2D3E] rounded-xl p-3 flex flex-col gap-1 min-w-[150px] shadow-xl">
              {FILTERS.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#D0D2D0] cursor-pointer font-body text-sm text-gray"
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.includes(f)}
                    onChange={() => toggleFilter(f)}
                    className="accent-[#FF6A3D]"
                  />
                  {f}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[#F3EFE6] text-sm font-body">
          <span>
            Showing {results.length} of {totalResults} tracks
          </span>
          <span>Page {page} of {totalPages}</span>
        </div>

        <div
          className={
            view === "list"
              ? "flex flex-col"
              : "grid grid-cols-2 gap-4"
          }
        >
          {results.map((t, i) => (
            <div
              key={`${page}-${i}-${t.title}-${t.artist}`}
              className={
                view === "list"
                  ? `flex items-center gap-4 py-4 ${
                      i !== results.length - 1 ? "border-b border-[#212333]" : ""
                    } hover:pl-2 transition-all`
                  : "flex items-center gap-4 p-4 rounded-xl border border-[#212333] hover:border-[#FF6A3D] transition-colors"
              }
            >
              <AlbumArtPlaceholder size="sm" />
              <div className="flex flex-col">
                <span className="font-body font-medium text-[#F3EFE6] text-base">
                  {t.title}
                </span>
                <span className="font-mono text-[#D0D2D0] text-xs">
                  {formatArtists(t.artist)} · {t.tempo} bpm
                </span>
              </div>
            </div>
          ))}
          {!loading && results.length === 0 && (
            <p className="font-body text-[#D0D2D0] text-sm py-6">
              Nothing matches "{query}" — try a different title or artist.
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={loading || page <= 1}
              className="rounded-full border border-[#2A2D3E] px-2.5 py-1 text-sm font-body text-[#F3EFE6] hover:bg-[#C5BCE7] hover:text-[#10121A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ←
            </button>
            {getVisiblePages().map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-sm font-body text-[#D0D2D0]">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  disabled={loading || p === page}
                  className={`min-w-8 rounded-full border px-2 py-1 text-sm font-body transition-colors disabled:cursor-not-allowed ${
                    p === page
                      ? "border-[#FF6A3D] bg-[#FF6A3D] text-[#10121A]"
                      : "border-[#2A2D3E] text-[#F3EFE6] hover:bg-[#C5BCE7] hover:text-[#10121A] disabled:opacity-40"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={loading || page >= totalPages}
              className="rounded-full border border-[#2A2D3E] px-2.5 py-1 text-sm font-body text-[#F3EFE6] hover:bg-[#C5BCE7] hover:text-[#10121A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
