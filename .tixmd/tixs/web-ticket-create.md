---
labels: [web]
dependencies: [web-kanban-board]
created: 2026-03-19T00:00:00Z
---

# Web ticket create

Create new tickets from the web UI with a friendly nudge to let the agent handle it.

## Acceptance criteria

- [ ] `POST /api/tickets` accepts a ticket ID + markdown body and writes a new file to `.tixmd/tixs/<id>.md` via `@tixmd/core`
- [ ] "New ticket" button on the board opens a creation form/drawer
- [ ] Form includes: ticket ID (slug), title, description, labels, and optional acceptance criteria
- [ ] A prominent suggestion is shown in the form: "For best results, let your agent create and groom tickets."
- [ ] On submit, writes the file and adds the new card to the board
- [ ] Validates that the ticket ID is unique and kebab-case before submitting
