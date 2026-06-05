// Simple Node.js server to launch the website locally
// Run with: node launch-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  
  // Serve index.html at root
  if (urlPath === '/' || urlPath === '') {
    urlPath = '/index.html';
  }
  // Serve favicon from app folder
  if (urlPath === '/favicon.ico') {
    urlPath = '/project-majestic-cauliflower-145.magicpatterns.app/favicon.ico';
  }

  // Normalize path (strip leading slash for correct path.join on Windows)
  const normalizedPath = urlPath.replace(/^\//, '').replace(/\/$/, '') || '';
  let filePath = path.join(ROOT, normalizedPath);
  
  // For directory requests, serve index.html
  if (urlPath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // Prevent path traversal
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(ROOT))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`\n  Website running at: ${url}\n`);
  // Open browser (Windows)
  const { exec } = require('child_process');
  exec(`start "" "${url}"`, () => {});
});
