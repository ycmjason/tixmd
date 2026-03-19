import { marked } from 'marked';
import { useEffect, useRef } from 'react';
import { STATUS_META } from './status.ts';
import type { Ticket } from './types.ts';

type Props = {
  ticket: Ticket | null;
  onClose: () => void;
};

export function TicketDrawer({ ticket, onClose }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ticket) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [ticket, onClose]);

  const isOpen = ticket !== null;

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 z-40 transition-opacity duration-200 cursor-default"
        style={{
          background: 'rgba(0,0,0,0.3)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full z-50 w-120 max-w-screen bg-surface border-l border-border flex flex-col transition-transform duration-200 ease-out overflow-hidden"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {ticket && (
          <>
            <div className="flex items-start gap-3 px-5 py-4 border-b border-border shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-medium"
                    style={{ color: STATUS_META[ticket.status].colorVar }}
                  >
                    {STATUS_META[ticket.status].icon} {STATUS_META[ticket.status].label}
                  </span>
                  <span className="text-[11px] text-text-faint font-mono">{ticket.id}</span>
                </div>
                <h2 className="text-[15px] font-semibold text-text leading-snug">{ticket.title}</h2>
                {ticket.labels.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {ticket.labels.map(label => (
                      <span
                        key={label}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-accent-muted text-accent font-medium"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-text-faint hover:text-text transition-colors text-lg leading-none shrink-0 mt-0.5"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {ticket.progress.total > 0 && (
              <div className="px-5 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-border">
                    <div
                      className="h-full rounded-full transition-all bg-accent"
                      style={{
                        width: `${(ticket.progress.checked / ticket.progress.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-text-muted shrink-0">
                    {ticket.progress.checked}/{ticket.progress.total}
                  </span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div
                className="prose-ticket"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown rendering
                dangerouslySetInnerHTML={{ __html: marked(ticket.body) }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
