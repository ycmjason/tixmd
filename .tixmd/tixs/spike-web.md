---
groomed_tickets: [web-kanban-board, web-ticket-editor, web-ticket-create]
created: 2026-03-19T00:00:00Z
---

# Spike: Web UI design

What should the local webapp (`@tixmd/web`) look like?

## Questions to answer

- Is the web UI a v1 feature or can it wait?
- Kanban board vs list view vs both?
- Read-only dashboard or full CRUD?
- How does it read tickets? Filesystem watcher? API server? Static build from `.tixmd/`?
- What framework beyond React + Vite? Any component library?
- Should it support drag-and-drop for status changes, or is that out of scope for a file-based system?
