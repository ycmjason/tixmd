import type { LexicalEditor } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteTicket, updateTicket } from './api.ts';
import { getMarkdownFromEditor, MarkdownEditor } from './markdown-editor.tsx';
import { STATUS_META } from './status.ts';
import type { Ticket } from './types.ts';

type Props = {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdated: () => void;
};

/** Reconstruct the full markdown file from ticket metadata + updated body */
function rebuildMarkdown({ ticket, body }: { ticket: Ticket; body: string }): string {
  const fm: Record<string, unknown> = {};
  if (ticket.labels.length > 0) fm.labels = ticket.labels;
  if (ticket.dependencies.length > 0) fm.dependencies = ticket.dependencies;
  if (ticket.created) fm.created = ticket.created;
  if (ticket.groomedTickets.length > 0) fm.groomed_tickets = ticket.groomedTickets;

  const hasFrontmatter = Object.keys(fm).length > 0;

  if (hasFrontmatter) {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(fm)) {
      if (Array.isArray(value)) {
        lines.push(`${key}: [${value.join(', ')}]`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
    return `---\n${lines.join('\n')}\n---\n\n${body}\n`;
  }

  return `${body}\n`;
}

export function TicketDrawer({ ticket, onClose, onUpdated }: Props) {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editorRef = useRef<LexicalEditor | null>(null);
  // Key to force remount of MarkdownEditor when ticket changes
  const [editorKey, setEditorKey] = useState(0);

  const ticketId = ticket?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: ticketId triggers reset when switching tickets
  useEffect(() => {
    setDirty(false);
    setSaving(false);
    setDeleting(false);
    setConfirmDelete(false);
    editorRef.current = null;
    setEditorKey(k => k + 1);
  }, [ticketId]);

  const isOpen = ticket !== null;

  const handleSave = useCallback(async () => {
    if (!ticket || !editorRef.current) return;
    setSaving(true);

    const newBody = getMarkdownFromEditor(editorRef.current);
    const fullMarkdown = rebuildMarkdown({ ticket, body: newBody });
    const result = await updateTicket({ id: ticket.id, markdown: fullMarkdown });

    setSaving(false);
    if (result.ok) {
      setDirty(false);
      onUpdated();
    }
  }, [ticket, onUpdated]);

  const handleDelete = useCallback(async () => {
    if (!ticket) return;
    setDeleting(true);
    const result = await deleteTicket({ id: ticket.id });
    setDeleting(false);
    if (result.ok) onUpdated();
  }, [ticket, onUpdated]);

  useEffect(() => {
    if (!ticket) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDelete) {
          setConfirmDelete(false);
        } else {
          onClose();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (dirty) void handleSave();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [ticket, onClose, confirmDelete, dirty, handleSave]);

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
        className="fixed right-0 top-0 h-full z-50 w-120 max-w-screen bg-surface border-l border-border flex flex-col transition-transform duration-200 ease-out overflow-hidden"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {ticket && (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 px-5 py-4 border-b border-border shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="tooltip-trigger">
                    <span
                      className="text-xs font-medium"
                      style={{ color: STATUS_META[ticket.status].colorVar }}
                    >
                      {STATUS_META[ticket.status].icon} {STATUS_META[ticket.status].label}
                    </span>
                    <span className="tooltip-text">Status is derived and cannot be edited</span>
                  </span>
                  <span className="tooltip-trigger">
                    <span className="text-[11px] text-text-faint font-mono">{ticket.id}</span>
                    <span className="tooltip-text">ID is derived from filename</span>
                  </span>
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

            {/* Progress bar */}
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

            {/* Editor */}
            <div className="flex-1 overflow-y-auto relative">
              <MarkdownEditor
                key={editorKey}
                initialMarkdown={ticket.body}
                editorRef={editorRef}
                onDirty={() => setDirty(true)}
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border shrink-0">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <p className="text-[12px] text-text-muted flex-1">
                    Delete this ticket? This cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1 text-[12px] font-medium text-text-muted hover:text-text transition-colors rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-2.5 py-1 text-[12px] font-medium rounded-md transition-colors"
                    style={{ color: 'var(--color-status-blocked)' }}
                  >
                    {deleting ? 'Deleting…' : 'Confirm delete'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-[11px] text-text-faint">
                      Let your agent handle this for the best results.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-2.5 py-1 text-[12px] font-medium text-text-faint hover:text-text-muted transition-colors rounded-md"
                  >
                    Delete
                  </button>
                  {dirty && (
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="px-2.5 py-1 text-[12px] font-medium bg-accent text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
