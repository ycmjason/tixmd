# tixmd

A lightweight, git-native project management system for solo developers working with AI agents. Tickets are plain markdown files with YAML frontmatter. No accounts, no hosted services — just files in your repo.

## Who is this for

Solo developers and small teams who:

- Use AI coding agents (Claude Code, Cursor, Copilot) as their primary workflow
- Want project management without leaving the repo
- Need their AI agent to understand, pick up, and complete tasks autonomously
- Value zero-setup and progressive complexity

## Quick start

```bash
# Install globally
npm i -g @tixmd/cli

# Initialize in your repo
tixmd init

# Create your first ticket
tixmd new --title "Fix login redirect" --body "Users land on / instead of their page"

# List tickets
tixmd list

# Start the web board
tixmd serve
```

Or just create files manually:

```bash
mkdir -p .tixmd/tixs
cat > .tixmd/tixs/fix-login-redirect.md << 'EOF'
# Fix login redirect bug

After signing in, users are redirected to `/` instead of the page they were on.

## Acceptance criteria

- [ ] Redirect to the original URL stored in query param
- [ ] Default to /dashboard if no redirect URL
- [ ] Works for both email and OAuth sign-in flows
EOF
```

That's it. A valid ticket is just a `.md` file with an H1.

## How it works

### The workflow

1. **Create spikes** — tickets with open questions, no acceptance criteria
2. **Groom into actionable tickets** — add acceptance criteria, each a `- [ ]` checkbox
3. **Pick up work** — find a `ready` ticket (has criteria, no blockers)
4. **Check off criteria** — `- [ ]` becomes `- [x]` as work is done
5. **Review via diff** — one git diff shows code changes AND ticket progress

### Ticket types

| Type | Has criteria? | Purpose |
|---|---|---|
| **Spike** | No | Explore unknowns, answer questions |
| **Actionable** | Yes | Deliver a vertical slice of value |

### Derived statuses

Status is never stored — it's computed from content and dependencies:

| Status | Condition |
|---|---|
| **spike** | No acceptance criteria |
| **resolved** | Spike groomed into tickets (has `groomed_tickets`) |
| **blocked** | Has criteria, but depends on non-done tickets |
| **ready** | Has criteria, no blockers, nothing checked |
| **doing** | Some criteria checked |
| **done** | All criteria checked |

### Frontmatter

Optional YAML frontmatter for metadata:

```yaml
---
labels: [auth, ux]
dependencies: [setup-auth]
created: 2026-03-15T14:30:00Z
---
```

| Field | Type | Notes |
|---|---|---|
| `labels` | `string[]` | Freeform tags for filtering |
| `dependencies` | `string[]` | Ticket IDs this is blocked by |
| `created` | ISO 8601 | Auto-populated on creation |
| `groomed_tickets` | `string[]` | Spike-only: tickets created from this spike |

## CLI

```
tixmd <command> [options]

Commands:
  init    Initialize a tixmd project
  list    List all tickets
  new     Create a new ticket
  serve   Start the web board

Options:
  --status, -s    Filter by status (list)
  --title, -t     Ticket title (new)
  --body, -b      Ticket body (new)
  --labels, -l    Comma-separated labels (new)
  --port, -p      Server port, default 4242 (serve)
```

## Web board

`tixmd serve` starts a local kanban board at `http://localhost:4242`:

- Columns grouped by **Spikes** (spike, resolved) and **Tickets** (blocked, ready, doing, done)
- Click any card to open the WYSIWYG markdown editor
- Checkboxes are directly toggleable
- Navigate between related tickets (blocked by, blocks, groomed into)
- Light/dark theme
- Create and delete tickets from the UI

## Claude Code skills

tixmd ships with Claude Code skills for AI-agent workflows:

| Skill | Purpose |
|---|---|
| `/tixmd-init` | Interactive project initialization |
| `/tixmd-list` | List tickets with status and progress |
| `/tixmd-new` | Create a ticket through grooming conversation |
| `/tixmd-groom` | Refine spikes into actionable tickets |
| `/tixmd-next` | Pick best ready ticket, work through it criterion by criterion |
| `/tixmd-project-spikify` | Generate spike tickets from project spec |

## Directory structure

```
.tixmd/
  project.md          # Project vision + config (frontmatter)
  tixs/               # Individual tickets
    fix-login.md
    add-button.md
```

## Architecture

```
@tixmd/core              <- pure logic: parse, query, validate
    |        |        |
  tixmd  @tixmd/mcp  @tixmd/web
```

All consumers depend on `@tixmd/core` directly.

## License

MIT
