import type { LexicalEditor } from 'lexical';
import { marked } from 'marked';
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

type Mode = 'view' | 'edit';

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

/** Render markdown body HTML with interactive (non-disabled) checkboxes */
function renderBodyHtml(body: string): string {
  const html = marked(body) as string;
  let checkboxIdx = 0;
  return html.replace(/<li><input (?:checked="" )?disabled="" type="checkbox">/g, match => {
    const idx = checkboxIdx++;
    const isChecked = match.includes('checked=""');
    return `<li><input type="checkbox" data-criterion-index="${idx}" ${isChecked ? 'checked' : ''}>`;
  });
}

function TicketBody({ html, onClick }: { html: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click delegates to rendered checkbox inputs inside the HTML
    <section
      className="prose-ticket px-5 py-4"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: rendered markdown with interactive checkboxes
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') onClick(e as unknown as React.MouseEvent);
      }}
    />
  );
}

export function TicketDrawer({ ticket, onClose, onUpdated }: Props) {
  const [mode, setMode] = useState<Mode>('view');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editorRef = useRef<LexicalEditor | null>(null);
  const [editMarkdown, setEditMarkdown] = useState('');

  // Reset state when a different ticket is selected
  const ticketId = ticket?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: ticketId triggers reset when switching tickets
  useEffect(() => {
    setMode('view');
    setSaving(false);
    setDeleting(false);
    setConfirmDelete(false);
    editorRef.current = null;
  }, [ticketId]);

  useEffect(() => {
    if (!ticket) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDelete) {
          setConfirmDelete(false);
        } else if (mode === 'edit') {
          setMode('view');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [ticket, onClose, mode, confirmDelete]);

  const isOpen = ticket !== null;

  const handleCheckboxToggle = useCallback(
    async (criterionIndex: number) => {
      if (!ticket) return;

      let idx = 0;
      const updatedBody = ticket.body.replace(
        /^([ \t]*- \[)([ xX])(\] .+)$/gm,
        (match, prefix: string, check: string, suffix: string) => {
          if (idx === criterionIndex) {
            idx++;
            return `${prefix}${check === ' ' ? 'x' : ' '}${suffix}`;
          }
          idx++;
          return match;
        },
      );

      const fullMarkdown = rebuildMarkdown({ ticket, body: updatedBody });
      const result = await updateTicket({ id: ticket.id, markdown: fullMarkdown });
      if (result.ok) onUpdated();
    },
    [ticket, onUpdated],
  );

  const handleSave = useCallback(async () => {
    if (!ticket || !editorRef.current) return;
    setSaving(true);

    const newBody = getMarkdownFromEditor(editorRef.current);
    const fullMarkdown = rebuildMarkdown({ ticket, body: newBody });
    const result = await updateTicket({ id: ticket.id, markdown: fullMarkdown });

    setSaving(false);
    if (result.ok) onUpdated();
  }, [ticket, onUpdated]);

  const handleDelete = useCallback(async () => {
    if (!ticket) return;
    setDeleting(true);
    const result = await deleteTicket({ id: ticket.id });
    setDeleting(false);
    if (result.ok) onUpdated();
  }, [ticket, onUpdated]);

  const handleEnterEdit = useCallback(() => {
    if (!ticket) return;
    setEditMarkdown(ticket.body);
    setMode('edit');
  }, [ticket]);

  const handleBodyClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
        e.preventDefault();
        const idx = Number(target.getAttribute('data-criterion-index'));
        if (!Number.isNaN(idx)) void handleCheckboxToggle(idx);
      }
    },
    [handleCheckboxToggle],
  );

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

            <div className="flex-1 overflow-y-auto">
              {mode === 'view' ? (
                <TicketBody html={renderBodyHtml(ticket.body)} onClick={handleBodyClick} />
              ) : (
                <div className="relative">
                  <MarkdownEditor initialMarkdown={editMarkdown} editorRef={editorRef} />
                </div>
              )}
            </div>

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
                  {mode === 'view' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="px-2.5 py-1 text-[12px] font-medium text-text-faint hover:text-text-muted transition-colors rounded-md"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={handleEnterEdit}
                        className="px-2.5 py-1 text-[12px] font-medium text-accent border border-accent/30 rounded-md hover:bg-accent-muted transition-colors"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setMode('view')}
                        className="px-2.5 py-1 text-[12px] font-medium text-text-muted hover:text-text transition-colors rounded-md"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-2.5 py-1 text-[12px] font-medium bg-accent text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </>
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
