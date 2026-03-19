---
labels: [web]
dependencies: [web-kanban-board]
created: 2026-03-19T00:00:00Z
---

# Web ticket editor

Edit and delete tickets from the web UI. Writing back to `.md` files on disk.

## Acceptance criteria

- [ ] `PUT /api/tickets/:id` accepts updated ticket markdown and writes it back to `.tixmd/tixs/<id>.md` via `@tixmd/core`
- [ ] `DELETE /api/tickets/:id` deletes the ticket file from disk
- [ ] Ticket detail drawer has an "Edit" mode — switches from rendered markdown to a markdown editor
- [ ] Criteria checkboxes are directly toggleable in view mode (no need to enter edit mode)
- [ ] Saving in edit mode writes to disk and refreshes the board
- [ ] Discarding changes restores the previous content
- [ ] Delete button in the detail drawer prompts for confirmation before deleting
- [ ] Delete and create actions show a friendly suggestion: "Let your agent handle this for the best results."
- [ ] Derived fields (status, ID) are not editable — show a tooltip explaining they are derived
