#!/usr/bin/env node

import { parseArgs } from 'node:util';
import type { TicketStatus } from '@tixmd/core';
import { initCommand } from './commands/init.ts';
import { listCommand } from './commands/list.ts';
import { newCommand } from './commands/new.ts';
import { serveCommand } from './commands/serve.ts';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    status: { type: 'string', short: 's' },
    title: { type: 'string', short: 't' },
    body: { type: 'string', short: 'b' },
    labels: { type: 'string', short: 'l' },
    dependencies: { type: 'string', short: 'd' },
    port: { type: 'string', short: 'p' },
    help: { type: 'boolean', short: 'h' },
  },
});

const command = positionals[0];

if (values.help || command === undefined) {
  console.log(`Usage: tixmd <command> [options]

Commands:
  init    Initialize a tixmd project
  list    List all tickets
  new     Create a new ticket
  serve   Start the local web server

Options (list):
  --status, -s <status>       Filter by status (spike|blocked|ready|doing|done)

Options (new):
  --title, -t <title>         Ticket title (required)
  --body, -b <body>           Ticket body (use \\n for newlines)
  --labels, -l <labels>       Comma-separated labels
  --dependencies, -d <deps>   Comma-separated dependency IDs

Options (init):
  --title, -t <title>         Project title (required)
  --body, -b <body>           Project description (use \\n for newlines)

Options (serve):
  --port, -p <port>           Port to listen on (default: 4242)

General:
  --help, -h                  Show this help message`);
  process.exit(0);
}

function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

switch (command) {
  case 'init': {
    if (!values.title) {
      console.error('--title is required for the init command');
      process.exitCode = 1;
      break;
    }
    await initCommand({
      title: values.title,
      body: (values.body ?? '').replaceAll('\\n', '\n'),
    });
    break;
  }
  case 'list':
    await listCommand({ status: values.status as TicketStatus | undefined });
    break;
  case 'new': {
    if (!values.title) {
      console.error('--title is required for the new command');
      process.exitCode = 1;
      break;
    }
    await newCommand({
      title: values.title,
      body: (values.body ?? '').replaceAll('\\n', '\n'),
      labels: parseCommaSeparated(values.labels),
      dependencies: parseCommaSeparated(values.dependencies),
    });
    break;
  }
  case 'serve':
    await serveCommand({ port: values.port ? Number(values.port) : 4242 });
    break;
  default:
    console.error(`Unknown command: ${command}`);
    process.exitCode = 1;
}
