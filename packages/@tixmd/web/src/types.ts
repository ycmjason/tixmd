export type TicketStatus = 'spike' | 'resolved' | 'blocked' | 'ready' | 'doing' | 'done';

export type Criterion = { text: string; checked: boolean };

export type Progress = { checked: number; total: number };

export type Ticket = {
  id: string;
  title: string;
  status: TicketStatus;
  labels: string[];
  dependencies: string[];
  created: string | undefined;
  updated: string | undefined;
  progress: Progress;
  criteria: Criterion[];
  blocks: string[];
  groomedTickets: string[];
  body: string;
};
