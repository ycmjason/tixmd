#!/usr/bin/env node

import { parseArgs } from 'node:util';
import type { TicketStatus } from '@tixmd/core';
import { listCommand } from './commands/list.ts';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    status: { type: 'string', short: 's' },
    help: { type: 'boolean', short: 'h' },
  },
});

const command = positionals[0];

if (values.help || command === undefined) {
  console.log(`Usage: tixmd <command> [options]

Commands:
  list    List all tickets

Options:
  --status, -s <status>  Filter by status (spike|blocked|ready|doing|done)
  --help, -h             Show this help message`);
  process.exit(0);
}

switch (command) {
  case 'list':
    await listCommand({ status: values.status as TicketStatus | undefined });
    break;
  default:
    console.error(`Unknown command: ${command}`);
    process.exitCode = 1;
}
