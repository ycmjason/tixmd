import { createReadStream } from 'node:fs';
import { access, readFile, unlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterTickets, generateTicketMarkdown, readBoard } from '@tixmd/core';

const DIST_DIR = fileURLToPath(new URL('../webapp', import.meta.url));

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

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function ticketPath(tixmdDir: string, id: string): string {
  return join(tixmdDir, 'tixs', `${id}.md`);
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

function matchRoute(pathname: string, pattern: string): Record<string, string> | undefined {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  if (patternParts.length !== pathParts.length) return undefined;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pat = patternParts[i] ?? '';
    const val = pathParts[i] ?? '';
    if (pat.startsWith(':')) {
      params[pat.slice(1)] = val;
    } else if (pat !== val) {
      return undefined;
    }
  }
  return params;
}

export function startServer({ tixmdDir, port }: { tixmdDir: string; port: number }): void {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);

    try {
      // GET /api/tickets
      if (req.method === 'GET' && url.pathname === '/api/tickets') {
        const board = await readBoard({ tixmdDir });
        const tickets = filterTickets({
          tickets: board.tickets,
          doneRetentionDays: board.config.done_retention_days,
        });
        json(res, tickets);
        return;
      }

      // GET /api/project
      if (req.method === 'GET' && url.pathname === '/api/project') {
        const board = await readBoard({ tixmdDir });
        json(res, board.config);
        return;
      }

      // POST /api/tickets — create a new ticket
      if (req.method === 'POST' && url.pathname === '/api/tickets') {
        const raw = await readBody(req);
        const payload = JSON.parse(raw) as {
          id: string;
          title: string;
          body: string;
          labels: string[];
          dependencies: string[];
          criteria: string[];
        };

        if (!KEBAB_CASE_RE.test(payload.id)) {
          json(
            res,
            { error: 'Ticket ID must be kebab-case (lowercase letters, numbers, hyphens)' },
            400,
          );
          return;
        }

        // Check uniqueness
        const filePath = ticketPath(tixmdDir, payload.id);
        try {
          await access(filePath);
          json(res, { error: `Ticket "${payload.id}" already exists` }, 409);
          return;
        } catch {
          // File doesn't exist — good
        }

        const criteriaBlock =
          payload.criteria.length > 0
            ? `## Acceptance criteria\n\n${payload.criteria.map(c => `- [ ] ${c}`).join('\n')}\n`
            : '';
        const fullBody = [payload.body, criteriaBlock].filter(Boolean).join('\n\n');

        const markdown = generateTicketMarkdown({
          title: payload.title,
          body: fullBody,
          labels: payload.labels,
          dependencies: payload.dependencies,
          created: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        });

        await writeFile(filePath, markdown);
        json(res, { id: payload.id }, 201);
        return;
      }

      // PUT /api/tickets/:id — update a ticket's markdown
      const putMatch = req.method === 'PUT' && matchRoute(url.pathname, '/api/tickets/:id');
      if (putMatch) {
        const { id } = putMatch;
        if (!id) {
          json(res, { error: 'Missing ticket ID' }, 400);
          return;
        }

        const filePath = ticketPath(tixmdDir, id);
        try {
          await access(filePath);
        } catch {
          json(res, { error: `Ticket "${id}" not found` }, 404);
          return;
        }

        const raw = await readBody(req);
        const payload = JSON.parse(raw) as { markdown: string };
        await writeFile(filePath, payload.markdown);
        json(res, { id });
        return;
      }

      // DELETE /api/tickets/:id — delete a ticket
      const deleteMatch = req.method === 'DELETE' && matchRoute(url.pathname, '/api/tickets/:id');
      if (deleteMatch) {
        const { id } = deleteMatch;
        if (!id) {
          json(res, { error: 'Missing ticket ID' }, 400);
          return;
        }

        const filePath = ticketPath(tixmdDir, id);
        try {
          await access(filePath);
        } catch {
          json(res, { error: `Ticket "${id}" not found` }, 404);
          return;
        }

        await unlink(filePath);
        json(res, { id });
        return;
      }

      await serveStatic(res, url.pathname);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      json(res, { error: message }, 500);
    }
  });

  server.listen(port, () => {
    console.log(`tixmd server running at http://localhost:${port}`);
  });
}
