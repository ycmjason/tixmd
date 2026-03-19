import { useState } from 'react';
import { COLUMN_ORDER, STATUS_META } from './status.ts';
import { ThemeToggle } from './theme-toggle.tsx';
import { TicketCard } from './ticket-card.tsx';
import { TicketDrawer } from './ticket-drawer.tsx';
import type { Ticket, TicketStatus } from './types.ts';
import { useBoard } from './use-board.ts';

function KanbanColumn({
  status,
  tickets,
  onSelect,
}: {
  status: TicketStatus;
  tickets: Ticket[];
  onSelect: (ticket: Ticket) => void;
}) {
  const meta = STATUS_META[status];

  return (
    <div className="flex flex-col gap-2 min-w-[220px] max-w-[260px] shrink-0">
      <div className="flex items-center gap-1.5 px-1 mb-1">
        <span className="text-xs font-medium" style={{ color: meta.colorVar }}>
          {meta.icon}
        </span>
        <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">
          {meta.label}
        </span>
        <span className="text-[11px] text-text-faint ml-auto">{tickets.length}</span>
      </div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} onClick={() => onSelect(ticket)} />
      ))}
    </div>
  );
}

export function App() {
  const boardState = useBoard();
  const [selected, setSelected] = useState<Ticket | null>(null);

  if (boardState.state === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen text-text-muted text-sm">
        Loading…
      </div>
    );
  }

  if (boardState.state === 'error') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="font-medium text-sm" style={{ color: 'var(--color-status-blocked)' }}>
            Failed to load board
          </p>
          <p className="text-text-muted text-xs mt-1">{boardState.message}</p>
        </div>
      </div>
    );
  }

  const { tickets } = boardState;
  const columnsByStatus = Object.fromEntries(
    COLUMN_ORDER.map(status => [status, tickets.filter(t => t.status === status)]),
  ) as Record<TicketStatus, Ticket[]>;
  const nonEmptyColumns = COLUMN_ORDER.filter(s => columnsByStatus[s].length > 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-text tracking-tight">tixmd</span>
          <span className="text-[11px] text-text-faint">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </span>
        </div>
        <ThemeToggle />
      </header>

      {nonEmptyColumns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
          No tickets yet. Ask your agent to create some.
        </div>
      ) : (
        <main className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 px-5 py-5 h-full items-start">
            {nonEmptyColumns.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tickets={columnsByStatus[status]}
                onSelect={setSelected}
              />
            ))}
          </div>
        </main>
      )}

      <TicketDrawer ticket={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
