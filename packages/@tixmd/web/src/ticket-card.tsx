import type { Ticket } from '@tixmd/core';
import { STATUS_META } from './status.ts';

type Props = {
  ticket: Ticket;
  onClick: () => void;
};

export function TicketCard({ ticket, onClick }: Props) {
  const meta = STATUS_META[ticket.status];
  const hasProgress = ticket.progress.total > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-md border border-border bg-surface hover:border-accent-muted hover:bg-surface-raised transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-xs shrink-0 font-medium" style={{ color: meta.colorVar }}>
          {meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-text leading-snug truncate">{ticket.title}</p>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">{ticket.id}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {ticket.labels.map(label => (
              <span
                key={label}
                className="text-[10px] px-1.5 py-0.5 rounded bg-accent-muted text-accent font-medium"
              >
                {label}
              </span>
            ))}
            {hasProgress && (
              <span className="text-[11px] text-text-muted ml-auto">
                {ticket.progress.checked}/{ticket.progress.total}
              </span>
            )}
            {ticket.dependencies.length > 0 && (
              <span
                className="text-[10px]"
                style={{ color: 'var(--color-status-blocked)' }}
                title={`Blocked by: ${ticket.dependencies.join(', ')}`}
              >
                ↑ blocked
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
