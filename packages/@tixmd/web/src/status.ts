import type { TicketStatus } from '@tixmd/core';

export const STATUS_META: Record<TicketStatus, { label: string; icon: string; colorVar: string }> =
  {
    spike: { label: 'Spike', icon: '?', colorVar: 'var(--color-status-spike)' },
    resolved: { label: 'Resolved', icon: '✓', colorVar: 'var(--color-status-resolved)' },
    blocked: { label: 'Blocked', icon: '!', colorVar: 'var(--color-status-blocked)' },
    ready: { label: 'Ready', icon: '○', colorVar: 'var(--color-status-ready)' },
    doing: { label: 'Doing', icon: '◐', colorVar: 'var(--color-status-doing)' },
    done: { label: 'Done', icon: '●', colorVar: 'var(--color-status-done)' },
  };

export const COLUMN_ORDER: TicketStatus[] = [
  'spike',
  'resolved',
  'blocked',
  'ready',
  'doing',
  'done',
];
