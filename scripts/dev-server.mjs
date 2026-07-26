import { createServer } from 'node:http';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT || 5173);
const ROOT = process.cwd();
const DATA_DIR = join(ROOT, 'data');
const EMAIL_LOG_FILE = join(DATA_DIR, 'manifesto-emails.jsonl');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function isValidEmail(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolvePath(urlPath) {
  const cleanPath = urlPath === '/' ? '/index.html' : urlPath;
  const normalized = normalize(cleanPath).replace(/^\/+/, '');
  return join(ROOT, normalized);
}

const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (requestUrl.pathname === '/api/manifesto/emails' && req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        return;
      }

      const email = body?.email?.trim().toLowerCase();
      if (!isValidEmail(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Valid email is required' }));
        return;
      }

      const record = {
        email,
        capturedAt: new Date().toISOString(),
        source: 'manifesto_modal',
      };

      await mkdir(DATA_DIR, { recursive: true });
      await appendFile(EMAIL_LOG_FILE, `${JSON.stringify(record)}\n`, 'utf8');
      console.log(`[email-capture] ${record.email} @ ${record.capturedAt}`);

      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    const filePath = resolvePath(requestUrl.pathname);

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    const file = await readFile(filePath);
    const mimeType = MIME_TYPES[extname(filePath)] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(file);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Snake game running at http://localhost:${PORT}`);
});
