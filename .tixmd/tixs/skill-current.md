---
labels: [skills]
dependencies: [skill-list]
created: 2026-03-17T00:00:00Z
---

# /tixmd-current — show currently working tickets

Create the `/tixmd-current` skill that shows tickets in `doing` status (some criteria checked, not all).

Reuses the core parsing, filtering, and `--status` flag built in skill-list.

## Acceptance criteria

- [x] Skill subfolder `skills/tixmd-current/SKILL.md` exists with correct frontmatter
- [x] Symlink `.claude/skills/tixmd-current` committed
- [x] Skill calls `tixmd list --status doing` (or equivalent) and presents doing tickets
- [x] CLI: `tixmd list` supports `--status` filter flag
- [x] Displays progress for each doing ticket (e.g. 2/5 criteria checked)
- [x] Shows ticket title, labels, and which criteria are checked vs unchecked
