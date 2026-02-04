#!/usr/bin/env node
import { createServer } from 'http';
import { searchHandler } from './handler';

const PORT = 3000;

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);

  if (url.pathname === '/api/search') {
    await searchHandler(req, res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Private Registry Server running at http://localhost:${PORT}`);
  console.log(`Use this server by running: export SKILLS_API_URL=http://localhost:${PORT}`);
});
