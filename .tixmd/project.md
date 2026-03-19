---
done_retention_days: 7
---

# tixmd

A lightweight, git-native project management system for solo developers working with AI agents. Tickets are plain markdown files with YAML frontmatter. No accounts, no hosted services — just files in your repo.

## Who is this for

Solo developers and small teams who:

- Use AI coding agents (Claude Code, Cursor, Copilot) as their primary workflow
- Want project management without leaving the repo or setting up a hosted tool
- Need their AI agent to understand, pick up, and complete tasks autonomously
- Value zero-setup and progressive complexity

## The core workflow

1. **Create spikes** — write tickets with open questions. Refine them into actionable tixes with acceptance criteria.
2. **Pick up work** — query the board, find a `ready` ticket (has criteria, no blockers), start working.
3. **Check off criteria** — check `- [ ]` → `- [x]` as each criterion is completed. Status moves from `ready` → `doing` → `done` automatically.
4. **Review via diff** — one git diff shows both code changes and ticket progress.
5. **Tickets, code, and progress all live in the same commit.**

## Core principles

1. **Plain files, zero setup** — `mkdir .tixmd` and start writing. No config, no accounts, no build step.
2. **AI-agent native** — MCP tools give agents structured access to the board. A skill/prompt teaches agents when and how to use them.
3. **Frontmatter is the source of truth** — ticket metadata (labels, dependencies, etc.) lives in YAML frontmatter.
4. **Derive, don't duplicate** — ticket ID comes from filename, title from H1, updated date from git. Never store what you can derive.
5. **Progressive complexity** — a valid ticket is just a `.md` file with an H1. Add frontmatter fields as you need them.

## Directory structure

```
.tixmd/
  project.md                     # product vision, principles, spec + config (frontmatter)
  tixs/                          # individual work items
    fix-login-redirect.md
    add-copy-button.md
```

Tickets live in `.tixmd/tixs/`. Use `labels` to group related tickets. Use `dependencies` to express ordering.

## Config (`project.md` frontmatter)

Board configuration lives in `project.md`'s YAML frontmatter. All fields are optional — defaults apply if absent.

| Field | Default | Notes |
|---|---|---|
| `done_retention_days` | `7` | Days before done tickets are hidden from default queries |

`done_retention_days` controls how long completed tickets remain visible on the board. After this period, done tickets are hidden from default queries but remain in the directory. All consumers (CLI, MCP, web) share this filtering logic via core.

## Ticket format

There are exactly two types of tickets:

| Type | Has acceptance criteria? | Purpose |
|---|---|---|
| **Spike** | No | Explore unknowns, answer open questions |
| **Actionable** | Yes | Deliver a vertical slice of user-facing value |

Every ticket starts as one or the other. Spikes get groomed into actionable tickets. Actionable tickets get worked on until done.

### Spike

A spike has open questions and no acceptance criteria. Its only job is to be explored and refined into one or more actionable tickets.

```markdown
---
created: 2026-03-15T14:30:00Z
---

# Explore authentication options

What auth provider should we use? What are the tradeoffs?

## Questions to answer

- OAuth vs magic link?
- Self-hosted vs hosted?
```

Once groomed, `groomed_tickets` is added to frontmatter and the spike becomes `resolved`.

### Actionable ticket

An actionable ticket has acceptance criteria and delivers a **vertical slice** — user-facing value end-to-end, not a single layer (e.g. not "build the API" alone). Ready for an agent to pick up and work through criterion by criterion.

```markdown
---
labels: [auth, ux]
dependencies: [setup-auth]
created: 2026-03-15T14:30:00Z
---

# Fix login redirect bug

After signing in, users are redirected to `/` instead of the page they were on.

## Acceptance criteria

- [ ] After sign-in, redirect to the original URL stored in query param
- [ ] If no redirect URL, default to `/dashboard`
- [ ] Works for both email and OAuth sign-in flows

## Notes

Session token is set correctly, the issue is in the callback handler
not reading the `redirect_to` param.
```

### Frontmatter fields

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `labels` | `string[]` | no | `[]` | freeform tags for filtering |
| `dependencies` | `string[]` | no | `[]` | ticket IDs this is blocked by (inverse "blocked by" is derived) |
| `created` | `string` (ISO 8601) | no | — | auto-populated on ticket creation |
| `groomed_tickets` | `string[]` | no | `[]` | spike-only: IDs of tickets created from this spike; presence marks the spike as `resolved` |

### Derived fields (never stored)

- **ID** — filename without `.md`
- **Title** — first H1 in markdown body
- **Status** — derived from content and dependencies (see below)
- **Updated** — git last-modified date on the file (via `git log`, not filesystem mtime which resets on clone)
- **Progress** — count of `- [x]` vs `- [ ]` in acceptance criteria
- **Blocks** — inverse of `dependencies` (computed by core from all tickets)

### Derived statuses

Status is never stored — it's computed from the ticket's content and dependency graph.

| Status | Condition |
|---|---|
| **spike** | no acceptance criteria and no `groomed_tickets` |
| **resolved** | no acceptance criteria but has `groomed_tickets` (spike was groomed into actionable tickets) |
| **blocked** | has acceptance criteria, but depends on non-done tickets |
| **ready** | has acceptance criteria, no blockers, nothing checked yet |
| **doing** | some criteria checked, but not all |
| **done** | all criteria checked |

> **Design decision**: `resolved` is derived from `groomed_tickets`, not stored as an explicit `status` field. This keeps all statuses computed (consistent with the "derive, don't duplicate" principle) while `groomed_tickets` serves dual purpose: traceability (which tickets this spike spawned) and status signal.

## Architecture

```
@tixmd/core              ← pure logic: parse, query, validate, write
    ↑        ↑        ↑
    |        |        |
  tixmd  @tixmd/mcp  @tixmd/web   ← all consumers depend on core directly
```

Core is the single source of logic. CLI, MCP server, and webapp all depend on core directly — no shelling out to the CLI.

## Tech stack

- TypeScript, Biome, Vitest, pnpm monorepo
- `@std/front-matter` + `@std/yaml` for frontmatter parsing
- `@modelcontextprotocol/sdk` for MCP server
- React + Vite for webapp

## Conventions

### Project conventions

- **Ticket style**: vertical slices — each ticket delivers user-facing value end-to-end. Avoid horizontal tickets that only touch one layer (e.g. "build API" or "build UI" alone).
- **Commit strategy**: up to the developer
- **Definition of done**: all acceptance criteria checked, lefthook passes

### Ticket conventions

- **Acceptance criteria as checklists** — check off `- [ ]` → `- [x]` as work is completed. Progress is visible at a glance.
- **Description is context** — write tickets like you're briefing a developer. Include the "why", relevant file paths, constraints.
- **Notes section** — append findings, blockers, or decisions as work progresses.
- **One ticket = one unit of work** — if subtasks are discovered, create new tickets with `dependencies` linking back.
- **Delete done tickets** — the code is committed, git history has the context. Don't accumulate completed tickets.

### Spike process

- Use interactive questions to explore options with the user.
- Recommend an option, but present alternatives with enough context for the user to decide.
- A spike "completes" by being refined into actionable tickets.

## Future ideas

- **GitHub Action** — validate tickets in CI, render board in PR comments
- **VSCode extension** — sidebar kanban board
- **Import/export** — Linear, Jira, GitHub Issues converters
- **Cycles/sprints** — time-boxed iterations
