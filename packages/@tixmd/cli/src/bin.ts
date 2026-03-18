#!/usr/bin/env node

import { parseArgs } from 'node:util';
import type { TicketStatus } from '@tixmd/core';
import { listCommand } from './commands/list.ts';
import { newCommand } from './commands/new.ts';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    status: { type: 'string', short: 's' },
    title: { type: 'string', short: 't' },
    body: { type: 'string', short: 'b' },
    labels: { type: 'string', short: 'l' },
    dependencies: { type: 'string', short: 'd' },
    help: { type: 'boolean', short: 'h' },
  },
});

const command = positionals[0];

if (values.help || command === undefined) {
  console.log(`Usage: tixmd <command> [options]

Commands:
  list    List all tickets
  new     Create a new ticket

Options (list):
  --status, -s <status>       Filter by status (spike|blocked|ready|doing|done)

Options (new):
  --title, -t <title>         Ticket title (required)
  --body, -b <body>           Ticket body (use \\n for newlines)
  --labels, -l <labels>       Comma-separated labels
  --dependencies, -d <deps>   Comma-separated dependency IDs

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
  default:
    console.error(`Unknown command: ${command}`);
    process.exitCode = 1;
}
