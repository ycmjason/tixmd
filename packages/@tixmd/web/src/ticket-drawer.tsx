import type { LexicalEditor } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createTicket, deleteTicket, updateTicket } from './api.ts';
import { getMarkdownFromEditor, MarkdownEditor } from './markdown-editor.tsx';
import { STATUS_META } from './status.ts';
import type { Ticket } from './types.ts';

type DrawerTarget = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; ticket: Ticket };

type Props = {
  target: DrawerTarget;
  tickets: Ticket[];
  onClose: () => void;
  onUpdated: () => void;
  onNavigate: (ticketId: string) => void;
};

const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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

function RelatedTickets({
  label,
  ids,
  colorVar,
  onNavigate,
}: {
  label: string;
  ids: string[];
  colorVar?: string;
  onNavigate: (id: string) => void;
}) {
  if (ids.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] text-text-faint">{label}</span>
      {ids.map(id => (
        <button
          key={id}
          type="button"
          onClick={() => onNavigate(id)}
          className="text-[10px] px-1.5 py-0.5 rounded font-mono hover:bg-accent-muted transition-colors cursor-pointer"
          style={{ color: colorVar ?? 'var(--color-accent)' }}
        >
          {id}
        </button>
      ))}
    </div>
  );
}

export function TicketDrawer({ target, tickets, onClose, onUpdated, onNavigate }: Props) {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newTicketId, setNewTicketId] = useState('');
  const [idError, setIdError] = useState<string | null>(null);
  const editorRef = useRef<LexicalEditor | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const ticket = target.mode === 'edit' ? target.ticket : null;
  const isNew = target.mode === 'new';
  const isOpen = target.mode !== 'closed';

  // Reset state when target changes
  const targetKey = target.mode === 'edit' ? target.ticket.id : target.mode;
  // biome-ignore lint/correctness/useExhaustiveDependencies: targetKey triggers reset when switching targets
  useEffect(() => {
    setDirty(false);
    setSaving(false);
    setDeleting(false);
    setConfirmDelete(false);
    setNewTicketId('');
    setIdError(null);
    editorRef.current = null;
    setEditorKey(k => k + 1);
  }, [targetKey]);

  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    const body = getMarkdownFromEditor(editorRef.current);

    if (isNew) {
      // Validate ID
      const id = newTicketId.trim();
      if (!id) {
        setIdError('Required');
        return;
      }
      if (!KEBAB_CASE_RE.test(id)) {
        setIdError('Must be kebab-case (e.g. fix-login-bug)');
        return;
      }
      if (tickets.some(t => t.id === id)) {
        setIdError('A ticket with this ID already exists');
        return;
      }

      setSaving(true);
      const result = await createTicket({
        id,
        title: '',
        body,
        labels: [],
        dependencies: [],
        criteria: [],
      });
      setSaving(false);
      if (result.ok) onUpdated();
      return;
    }

    if (!ticket) return;
    setSaving(true);
    const fullMarkdown = rebuildMarkdown({ ticket, body });
    const result = await updateTicket({ id: ticket.id, markdown: fullMarkdown });
    setSaving(false);
    if (result.ok) {
      setDirty(false);
      onUpdated();
    }
  }, [ticket, isNew, newTicketId, tickets, onUpdated]);

  const handleDelete = useCallback(async () => {
    if (!ticket) return;
    setDeleting(true);
    const result = await deleteTicket({ id: ticket.id });
    setDeleting(false);
    if (result.ok) onUpdated();
  }, [ticket, onUpdated]);

  useEffect(() => {
    if (!isOpen) return;
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
        if (dirty || isNew) void handleSave();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, confirmDelete, dirty, isNew, handleSave]);

  const hasRelations =
    ticket &&
    (ticket.dependencies.length > 0 ||
      ticket.blocks.length > 0 ||
      ticket.groomedTickets.length > 0);

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
        {isOpen && (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 px-5 py-4 border-b border-border shrink-0">
              <div className="flex-1 min-w-0">
                {isNew ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] font-medium text-text-muted">New ticket</span>
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={newTicketId}
                        onChange={e => {
                          setNewTicketId(e.target.value);
                          setIdError(null);
                        }}
                        placeholder="ticket-id (kebab-case)"
                        className="field-input font-mono text-[12px]"
                        // biome-ignore lint/a11y/noAutofocus: drawer opening should focus the ID field
                        autoFocus
                      />
                      {idError && (
                        <span
                          className="text-[11px]"
                          style={{ color: 'var(--color-status-blocked)' }}
                        >
                          {idError}
                        </span>
                      )}
                    </div>
                  </div>
                ) : ticket ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
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
                    {ticket.labels.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
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
                ) : null}
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

            {/* Related tickets */}
            {hasRelations && (
              <div className="px-5 py-2.5 border-b border-border shrink-0 flex flex-col gap-1.5">
                <RelatedTickets
                  label="blocked by"
                  ids={ticket.dependencies}
                  colorVar="var(--color-status-blocked)"
                  onNavigate={onNavigate}
                />
                <RelatedTickets
                  label="blocks"
                  ids={ticket.blocks}
                  colorVar="var(--color-status-blocked)"
                  onNavigate={onNavigate}
                />
                <RelatedTickets
                  label="groomed into"
                  ids={ticket.groomedTickets}
                  onNavigate={onNavigate}
                />
              </div>
            )}

            {/* Progress bar */}
            {ticket && ticket.progress.total > 0 && (
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

            {/* Tip for new tickets */}
            {isNew && (
              <div className="mx-5 mt-4 rounded-md px-3 py-2.5 text-[12px] text-text-muted leading-relaxed border border-border bg-surface-raised">
                <span className="font-medium text-accent">Tip:</span> For best results, let your
                agent create and groom tickets.
              </div>
            )}

            {/* Editor */}
            <div className="flex-1 overflow-y-auto relative">
              <MarkdownEditor
                key={editorKey}
                initialMarkdown={isNew ? '# \n\n' : (ticket?.body ?? '')}
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
                  {!isNew && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-2.5 py-1 text-[12px] font-medium text-text-faint hover:text-text-muted transition-colors rounded-md"
                    >
                      Delete
                    </button>
                  )}
                  {(dirty || isNew) && (
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="px-2.5 py-1 text-[12px] font-medium bg-accent text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
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
