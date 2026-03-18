---
labels: [skills]
dependencies: [skill-list]
created: 2026-03-17T00:00:00Z
---

# /tixmd-groom — groom any ticket

Create the `/tixmd-groom` skill that refines any ticket — elaborating spikes into actionable tixes, or improving criteria on existing tickets.

## Acceptance criteria

- [x] Skill subfolder `skills/tixmd-groom/SKILL.md` exists with correct frontmatter
- [x] Symlink `.claude/skills/tixmd-groom` committed
- [x] Skill auto-detects target ticket from currently open file if it's a `.tixmd/tixs/*.md` file
- [x] If no ticket detected from context, skill calls `tixmd list` and asks user to pick a ticket
- [x] For spikes: uses AskUserQuestion to explore options interactively, recommends choices, presents alternatives
- [x] For spikes: converts spike into actionable ticket with acceptance criteria after discussion
- [x] For existing actionable tickets: refines or adds acceptance criteria, improves descriptions
- [x] Skill writes updated ticket content via CLI (or direct file write)
- [x] Preserves existing frontmatter fields when updating a ticket
