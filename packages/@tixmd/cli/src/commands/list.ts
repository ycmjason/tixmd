import {
  type FilterOptions,
  filterTickets,
  readBoard,
  type Ticket,
  type TicketStatus,
  ticketStatuses,
} from '@tixmd/core';
import { findTixmdDir } from '../find-tixmd-dir.ts';

const STATUS_ICONS: Record<TicketStatus, string> = {
  spike: '?',
  blocked: '!',
  ready: '○',
  doing: '◐',
  done: '●',
};

function formatTicketLine(ticket: Ticket): string {
  const icon = STATUS_ICONS[ticket.status];
  const progress =
    ticket.progress.total > 0 ? ` [${ticket.progress.checked}/${ticket.progress.total}]` : '';
  const labels = ticket.labels.length > 0 ? ` (${ticket.labels.join(', ')})` : '';
  return `  ${icon} ${ticket.status.padEnd(7)} ${ticket.id}${progress}${labels}`;
}

export async function listCommand({ status }: { status: TicketStatus | undefined }): Promise<void> {
  if (status !== undefined && !(ticketStatuses as readonly string[]).includes(status)) {
    console.error(`Invalid status: ${status}. Must be one of: ${ticketStatuses.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const tixmdDir = await findTixmdDir(process.cwd());
  const board = await readBoard({ tixmdDir });

  for (const warning of board.warnings) {
    console.warn(`⚠ ${warning}`);
  }

  const filterOpts: FilterOptions & { tickets: Ticket[] } = {
    tickets: board.tickets,
    doneRetentionDays: board.config.done_retention_days,
    ...(status !== undefined ? { status } : {}),
  };

  const filtered = filterTickets(filterOpts);

  if (filtered.length === 0) {
    console.log('No tickets found.');
    return;
  }

  for (const ticket of filtered) {
    console.log(formatTicketLine(ticket));
  }
}
