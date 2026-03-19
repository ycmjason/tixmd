import { type ChangeEvent, type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { createTicket } from './api.ts';

const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type Props = {
  open: boolean;
  existingIds: string[];
  onClose: () => void;
  onCreated: () => void;
};

type FormState = {
  id: string;
  title: string;
  description: string;
  labels: string;
  criteria: string;
};

const EMPTY_FORM: FormState = { id: '', title: '', description: '', labels: '', criteria: '' };

function deriveId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function validate({
  form,
  existingIds,
}: {
  form: FormState;
  existingIds: string[];
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.id.trim()) errors.id = 'Required';
  else if (!KEBAB_CASE_RE.test(form.id)) errors.id = 'Must be kebab-case (e.g. fix-login-bug)';
  else if (existingIds.includes(form.id)) errors.id = 'A ticket with this ID already exists';
  if (!form.title.trim()) errors.title = 'Required';
  return errors;
}

export function CreateTicketDrawer({ open, existingIds, onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [idManuallyEdited, setIdManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const idInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setIdManuallyEdited(false);
      setSubmitting(false);
      setSubmitError(null);
      setTouched(new Set());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const errors = validate({ form, existingIds });

  const setField = useCallback(
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm(prev => {
        if (field === 'title' && !idManuallyEdited) {
          return { ...prev, title: value, id: deriveId(value) };
        }
        return { ...prev, [field]: value };
      });
    },
    [idManuallyEdited],
  );

  const handleIdChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIdManuallyEdited(true);
    setForm(prev => ({ ...prev, id: e.target.value }));
  }, []);

  const handleBlur = useCallback(
    (field: string) => () => setTouched(prev => new Set(prev).add(field)),
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setTouched(new Set(['id', 'title']));
      if (Object.keys(errors).length > 0) return;

      setSubmitting(true);
      setSubmitError(null);

      const result = await createTicket({
        id: form.id,
        title: form.title,
        body: form.description.trim(),
        labels: form.labels
          .split(',')
          .map(l => l.trim())
          .filter(Boolean),
        dependencies: [],
        criteria: form.criteria
          .split('\n')
          .map(c => c.trim())
          .filter(Boolean),
      });

      if (!result.ok) {
        setSubmitError(result.error);
        setSubmitting(false);
        return;
      }

      onCreated();
      onClose();
    },
    [form, errors, onCreated, onClose],
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 z-40 transition-opacity duration-200 cursor-default"
        style={{
          background: 'rgba(0,0,0,0.3)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      <div
        className="fixed right-0 top-0 h-full z-50 w-120 max-w-screen bg-surface border-l border-border flex flex-col transition-transform duration-200 ease-out overflow-hidden"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-[15px] font-semibold text-text">New ticket</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-faint hover:text-text transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-5 py-4 flex flex-col gap-4 flex-1">
            <div className="rounded-md px-3 py-2.5 text-[12px] text-text-muted leading-relaxed border border-border bg-surface-raised">
              <span className="font-medium text-accent">Tip:</span> For best results, let your agent
              create and groom tickets.
            </div>

            <FieldGroup label="Title" error={touched.has('title') ? errors.title : undefined}>
              <input
                type="text"
                value={form.title}
                onChange={setField('title')}
                onBlur={handleBlur('title')}
                placeholder="Fix login redirect bug"
                className="field-input"
                // biome-ignore lint/a11y/noAutofocus: drawer opening should focus the first field
                autoFocus
              />
            </FieldGroup>

            <FieldGroup label="ID" error={touched.has('id') ? errors.id : undefined}>
              <input
                ref={idInputRef}
                type="text"
                value={form.id}
                onChange={handleIdChange}
                onBlur={handleBlur('id')}
                placeholder="fix-login-redirect"
                className="field-input font-mono text-[12px]"
              />
            </FieldGroup>

            <FieldGroup label="Description" optional>
              <textarea
                value={form.description}
                onChange={setField('description')}
                placeholder="Context for the developer or agent..."
                className="field-input min-h-[80px] resize-y"
                rows={3}
              />
            </FieldGroup>

            <FieldGroup label="Labels" optional>
              <input
                type="text"
                value={form.labels}
                onChange={setField('labels')}
                placeholder="auth, ux (comma-separated)"
                className="field-input"
              />
            </FieldGroup>

            <FieldGroup label="Acceptance criteria" optional>
              <textarea
                value={form.criteria}
                onChange={setField('criteria')}
                placeholder={
                  'One criterion per line\nRedirect to original URL after sign-in\nDefault to /dashboard if no redirect URL'
                }
                className="field-input min-h-[80px] resize-y"
                rows={3}
              />
            </FieldGroup>
          </div>

          <div className="px-5 py-4 border-t border-border shrink-0 flex items-center gap-3">
            {submitError && (
              <p className="text-[12px] flex-1" style={{ color: 'var(--color-status-blocked)' }}>
                {submitError}
              </p>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-[12px] font-medium text-text-muted hover:text-text transition-colors rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 text-[12px] font-medium bg-accent text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create ticket'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function FieldGroup({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-text-muted">
        {label}
        {optional && <span className="text-text-faint ml-1 font-normal">optional</span>}
      </span>
      {children}
      {error && (
        <span className="text-[11px]" style={{ color: 'var(--color-status-blocked)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
