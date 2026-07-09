const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'Backend');
const backendPath = path.join(backendDir, 'spotify_backend.exe');

function runBackend(query = '', filters = []) {
  return new Promise((resolve, reject) => {
    const args = ['--query', query];
    filters.forEach((filter) => args.push('--filter', filter));

    const child = spawn(backendPath, args, {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Backend exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (error) {
        resolve({ success: true, query, results: [] });
      }
    });
  });
}

module.exports = { runBackend };
