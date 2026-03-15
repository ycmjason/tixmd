# tixmd — Agent Plan Prompt

You are building **tixmd**, a lightweight, git-native project management system for solo developers working with AI agents. Tickets are plain markdown files with YAML frontmatter in a flat directory. No accounts, no hosted services — just files in your repo.

## Who is this for

Solo developers and small teams who:

- Use AI coding agents (Claude Code, Cursor, Copilot) as their primary workflow
- Want project management without leaving the repo or setting up a hosted tool
- Need their AI agent to understand, pick up, and complete tasks autonomously
- Value zero-setup and progressive complexity

## The core workflow

1. **Human manages the board via webapp** — create tickets, prioritize, drag between columns, review progress on a visual kanban board
2. **AI agent picks up work** — agent queries MCP tools, finds the highest-priority `todo` ticket, starts working
3. **Agent updates progress** — checks off acceptance criteria, moves status to `done` when complete
4. **Human reviews** — one git diff shows both code changes and ticket status updates
5. **Tickets, code, and progress all live in the same commit**

## Core Principles

1. **Plain files, zero setup** — `mkdir .tixmd` and start writing. No config, no accounts, no build step.
2. **AI-agent native** — MCP tools give agents structured access to the board. A skill/prompt teaches agents when and how to use them.
3. **Frontmatter is the source of truth** — all ticket metadata (status, priority, labels, etc.) lives in YAML frontmatter.
4. **Derive, don't duplicate** — ticket ID comes from filename, title from H1, updated date from git. Never store what you can derive.
5. **Progressive complexity** — a valid ticket is just a `.md` file with an H1. Add frontmatter fields as you need them. Add `config.yml` when defaults aren't enough.

## Directory Structure

```
.tixmd/
  config.yml                     # optional — column order, custom statuses
  fix-login-redirect.md
  add-copy-button.md
  setup-auth.md
```

All tickets are flat `.md` files in `.tixmd/`. No subdirectories — status is a frontmatter field.

## Config (`.tixmd/config.yml`)

Optional. Defines column order for the kanban board.

```yaml
statuses: [backlog, todo, doing, in-review, done]
```

If absent, defaults to: `backlog → todo → doing → in-review → done`.

Tickets with a `status` value not in this list appear as an extra column at the end of the board.

## Ticket Format

### Minimal valid ticket

```markdown
# Fix login redirect bug
```

Filename: `fix-login-redirect.md` (kebab-case)
That's it. ID = `fix-login-redirect`, status = `backlog` (default), title = H1.

### Full-featured ticket

```markdown
---
status: doing
priority: p1
labels: [auth, ux]
assignee: ycmjason
dependencies: [setup-auth]
blocks: [dashboard-login]
created: 2026-03-15
due: 2026-03-29
estimate: m
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
| `status` | `string` | no | `backlog` | must match a value in config statuses |
| `priority` | `p0 \| p1 \| p2 \| p3` | no | `p2` | p0 = urgent, p3 = low |
| `labels` | `string[]` | no | `[]` | freeform tags for filtering |
| `assignee` | `string` | no | — | GitHub username or name |
| `dependencies` | `string[]` | no | `[]` | ticket IDs this is blocked by |
| `blocks` | `string[]` | no | `[]` | ticket IDs this blocks |
| `created` | `date` | no | — | falls back to git first-commit date |
| `due` | `date` | no | — | |
| `estimate` | `xs \| s \| m \| l \| xl` | no | — | t-shirt sizing |

### Derived fields (never stored)

- **ID** — filename without `.md`
- **Title** — first H1 in markdown body
- **Updated** — git last-modified date on the file
- **Progress** — count of `- [x]` vs `- [ ]` in acceptance criteria

### Conventions for AI agents

- **Acceptance criteria as checklists** — agents check off `- [ ]` → `- [x]` as they complete work. Humans can see progress at a glance.
- **Description is context for the agent** — write tickets like you're briefing a developer. Include the "why", relevant file paths, constraints.
- **Notes section** — agents can append findings, blockers, or decisions here as they work.
- **One ticket = one unit of work** — if an agent discovers subtasks, it creates new tickets with `dependencies` linking back.

## Architecture

```
@tixmd/core              ← pure logic: parse, query, validate, write
    ↑
    |
  tixmd                  ← CLI: thin wrapper over core
    ↑        ↑
    |        |
@tixmd/mcp  @tixmd/web   ← MCP + webapp both go through CLI
```

Core is the foundation. The CLI wraps core. MCP server and webapp both invoke the CLI, keeping one code path for all consumers.

## What to Build

### `@tixmd/core` — Parser library

Pure TypeScript library for reading/writing `.tixmd/`. Parses frontmatter, extracts titles, counts checklist progress. No side effects, no CLI dependencies.

### `tixmd` — CLI

Thin wrapper over core. Commands for init, creating/listing/updating/moving tickets, rendering an ASCII board, and validating the board. Supports `--json` output for programmatic consumers.

### `@tixmd/mcp` — MCP Server

AI agent integration layer. Exposes board operations as MCP tools. Calls the CLI under the hood.

### `@tixmd/web` — Webapp

Interactive kanban board. Drag-and-drop, filtering, ticket editing. Reads/writes via the CLI.

### Skill / Prompt

A prompt file that teaches AI agents how to use the MCP tools: how to find the next ticket, update progress, and create subtasks.

## Future ideas

- **GitHub Action** — validate tickets in CI, render board in PR comments
- **VSCode extension** — sidebar kanban board
- **Import/export** — Linear, Jira, GitHub Issues converters
- **Projects/epics** — group tickets under goal-oriented projects
- **Cycles/sprints** — time-boxed iterations

## Tech Stack

- TypeScript, Biome, Vitest, pnpm monorepo
- gray-matter for frontmatter parsing
- `@modelcontextprotocol/sdk` for MCP server
- React + Vite for webapp
