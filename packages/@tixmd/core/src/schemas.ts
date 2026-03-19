import { z } from 'zod';

export const ticketFrontmatterSchema = z.object({
  labels: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  created: z.iso.datetime().optional(),
  groomed_tickets: z.array(z.string()).default([]),
});

export type TicketFrontmatter = z.infer<typeof ticketFrontmatterSchema>;

export const projectConfigSchema = z.object({
  done_retention_days: z.number().default(7),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export const ticketStatuses = ['spike', 'resolved', 'blocked', 'ready', 'doing', 'done'] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

export type Criterion = {
  text: string;
  checked: boolean;
};

export type Progress = {
  checked: number;
  total: number;
};

export type Ticket = {
  id: string;
  title: string;
  status: TicketStatus;
  labels: string[];
  dependencies: string[];
  created: string | undefined;
  updated: Date | undefined;
  progress: Progress;
  criteria: Criterion[];
  blocks: string[];
  groomedTickets: string[];
  body: string;
};
