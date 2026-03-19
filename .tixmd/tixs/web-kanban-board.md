---
labels: [web]
created: 2026-03-19T00:00:00Z
---

# Web kanban board

`tixmd serve` starts a local server and opens a read-only kanban board in the browser.

## Acceptance criteria

- [x] `tixmd serve` command added to CLI, starts server on port `4242` (overridable via `--port <n>`)
- [x] `GET /api/tickets` returns all tickets as JSON via `@tixmd/core`
- [x] `GET /api/project` returns project config
- [x] Vite dev mode proxies `/api`; production build served statically from the same process
- [x] Run `/teach-impeccable` before building UI to establish design context
- [x] Tailwind v4 + CSS variable design tokens for all colours — no `dark:` prefix; theme switching via root attribute toggling token values
- [x] Base UI used for interactive primitives (tooltips, popovers) if needed
- [x] Kanban board with columns: `spike`, `resolved`, `blocked`, `ready`, `doing`, `done`
- [x] Each card shows: ticket ID, title, labels, progress (`3/5`), blocked-by indicator
- [x] Empty columns hidden or shown as subtle placeholders
- [x] Clicking a card opens a detail panel/drawer with full ticket markdown rendered
- [x] Light/dark toggle persists to `localStorage`
