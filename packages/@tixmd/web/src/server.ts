import { createReadStream } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterTickets, readBoard } from '@tixmd/core';

const DIST_DIR = fileURLToPath(new URL('../dist', import.meta.url));

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

function json(res: import('node:http').ServerResponse, data: unknown, status = 200): void {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

async function serveStatic(
  res: import('node:http').ServerResponse,
  pathname: string,
): Promise<void> {
  const filePath = join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

  try {
    await access(filePath);
    const mime = MIME_TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    createReadStream(filePath).pipe(res);
  } catch {
    // SPA fallback — serve index.html for unknown routes
    const indexPath = join(DIST_DIR, 'index.html');
    const html = await readFile(indexPath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

export function startServer({ tixmdDir, port }: { tixmdDir: string; port: number }): void {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);

    if (req.method === 'GET' && url.pathname === '/api/tickets') {
      const board = await readBoard({ tixmdDir });
      const tickets = filterTickets({
        tickets: board.tickets,
        doneRetentionDays: board.config.done_retention_days,
      });
      json(res, tickets);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/project') {
      const board = await readBoard({ tixmdDir });
      json(res, board.config);
      return;
    }

    await serveStatic(res, url.pathname);
  });

  server.listen(port, () => {
    console.log(`tixmd server running at http://localhost:${port}`);
  });
}
