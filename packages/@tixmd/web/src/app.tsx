import { useCallback, useState } from 'react';
import { COLUMN_ORDER, STATUS_META } from './status.ts';
import { ThemeToggle } from './theme-toggle.tsx';
import { TicketCard } from './ticket-card.tsx';
import { TicketDrawer } from './ticket-drawer.tsx';
import type { Ticket, TicketStatus } from './types.ts';
import { useBoard } from './use-board.ts';

const SPIKE_STATUSES: TicketStatus[] = ['spike', 'resolved'];
const TICKET_STATUSES: TicketStatus[] = ['blocked', 'ready', 'doing', 'done'];

/** Sort tickets within a column: by progress (most complete first), then by ID */
function sortTickets(tickets: Ticket[]): Ticket[] {
  return tickets.toSorted((a, b) => {
    const aRatio = a.progress.total > 0 ? a.progress.checked / a.progress.total : 0;
    const bRatio = b.progress.total > 0 ? b.progress.checked / b.progress.total : 0;
    if (bRatio !== aRatio) return bRatio - aRatio;
    return a.id.localeCompare(b.id);
  });
}

function ColumnGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 shrink-0">
      <span className="text-[10px] font-semibold text-text-faint uppercase tracking-widest px-1">
        {label}
      </span>
      <div className="flex gap-4">{children}</div>
    </div>
  );
}

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

type DrawerTarget = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; ticket: Ticket };

export function App() {
  const boardState = useBoard();
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget>({ mode: 'closed' });

  const handleNavigate = useCallback(
    (ticketId: string) => {
      if (boardState.state !== 'ready') return;
      const found = boardState.tickets.find(t => t.id === ticketId);
      if (found) setDrawerTarget({ mode: 'edit', ticket: found });
    },
    [boardState],
  );

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

  const { tickets, refresh } = boardState;
  const columnsByStatus = Object.fromEntries(
    COLUMN_ORDER.map(status => [status, sortTickets(tickets.filter(t => t.status === status))]),
  ) as Record<TicketStatus, Ticket[]>;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-text tracking-tight">tixmd</span>
          <span className="text-[11px] text-text-faint">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerTarget({ mode: 'new' })}
            className="px-2.5 py-1 text-[12px] font-medium text-accent border border-accent/30 rounded-md hover:bg-accent-muted transition-colors"
          >
            + New
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="flex gap-6 px-5 py-5 min-h-full items-start">
          <ColumnGroup label="Spikes">
            {SPIKE_STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tickets={columnsByStatus[status]}
                onSelect={t => setDrawerTarget({ mode: 'edit', ticket: t })}
              />
            ))}
          </ColumnGroup>
          <div className="w-px self-stretch bg-border shrink-0" />
          <ColumnGroup label="Tickets">
            {TICKET_STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tickets={columnsByStatus[status]}
                onSelect={t => setDrawerTarget({ mode: 'edit', ticket: t })}
              />
            ))}
          </ColumnGroup>
        </div>
      </main>

      <TicketDrawer
        target={drawerTarget}
        tickets={tickets}
        onClose={() => setDrawerTarget({ mode: 'closed' })}
        onUpdated={() => {
          refresh();
          setDrawerTarget({ mode: 'closed' });
        }}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
