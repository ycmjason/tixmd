import type { Ticket, TicketStatus } from './schemas.ts';

export type FilterOptions = {
  status?: TicketStatus;
  labels?: string[];
  doneRetentionDays?: number;
  now?: Date;
};

export function filterTickets({
  tickets,
  ...opts
}: FilterOptions & { tickets: Ticket[] }): Ticket[] {
  return tickets.filter(ticket => {
    if (opts.status !== undefined && ticket.status !== opts.status) return false;

    if (opts.labels !== undefined && opts.labels.length > 0) {
      if (!opts.labels.some(label => ticket.labels.includes(label))) return false;
    }

    if (opts.doneRetentionDays !== undefined && ticket.status === 'done' && ticket.updated) {
      const now = opts.now ?? new Date();
      const cutoff = new Date(now.getTime() - opts.doneRetentionDays * 24 * 60 * 60 * 1000);
      if (ticket.updated < cutoff) return false;
    }

    return true;
  });
}
