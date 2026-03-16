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

### Spike (needs refinement)

A ticket with no acceptance criteria. It has open questions that need exploration before work can begin.

```markdown
# Explore authentication options

What auth provider should we use? What are the tradeoffs?

## Questions to answer

- OAuth vs magic link?
- Self-hosted vs hosted?
```

A spike "completes" by being refined into one or more tixes with acceptance criteria.

### Actionable ticket

A ticket with acceptance criteria. Ready for an agent to pick up (if not blocked).

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
| **spike** | no acceptance criteria (`- [ ]` / `- [x]`) in the body |
| **blocked** | has acceptance criteria, but depends on non-done tickets |
| **ready** | has acceptance criteria, no blockers, nothing checked yet |
| **doing** | some criteria checked, but not all |
| **done** | all criteria checked |

## Conventions

- **Acceptance criteria as checklists** — check off `- [ ]` → `- [x]` as work is completed. Progress is visible at a glance.
- **Description is context** — write tickets like you're briefing a developer. Include the "why", relevant file paths, constraints.
- **Notes section** — append findings, blockers, or decisions as work progresses.
- **One ticket = one unit of work** — if subtasks are discovered, create new tickets with `dependencies` linking back.

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

## Methodology

### Ticket design

- **Each ticket should deliver user value** — slice vertically through the stack (core + CLI/MCP), not horizontally by module. Internal plumbing is an implementation detail, not a ticket.
- **Delete done tickets** — the code is committed, git history has the context. Don't accumulate completed tickets.

### Spike process

- Use interactive questions (AskUserQuestion) to explore options with the user.
- Recommend an option, but present alternatives with enough context for the user to decide.
- A spike "completes" by being refined into actionable tickets.

### Implementation approach

- **Functional Core, Imperative Shell** — pure logic functions (data in → data out), thin I/O wrappers for filesystem/git. See AGENTS.md for details.
- **Eager derivation** — compute all derived fields (title, status, progress, blocks) upfront, not lazily.
- **Batch git log** — get `updated` dates for all ticket files in one call, not per-file.
- **`@std/front-matter` + `@std/yaml`** for YAML frontmatter parsing (not gray-matter). Note: `@std/yaml` coerces ISO 8601 strings to JS Date objects — convert back to string before Zod validation.
- **Zod 4** — use `z.iso.datetime()` (not deprecated `z.string().datetime()`).
- **Index-based criterion checking** — simple and sufficient for solo-dev workflow where criteria don't shift while an agent is working.
- **filterTickets as pure function** — all criteria optional, combine with AND logic. Done-retention is a filter option, not baked into the read path.

## Future ideas

- **GitHub Action** — validate tickets in CI, render board in PR comments
- **VSCode extension** — sidebar kanban board
- **Import/export** — Linear, Jira, GitHub Issues converters
- **Cycles/sprints** — time-boxed iterations
