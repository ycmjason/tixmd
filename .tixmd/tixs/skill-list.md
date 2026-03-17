---
labels: [skills]
created: 2026-03-17T00:00:00Z
---

# /tixmd-list — list all tickets

Create the `/tixmd-list` skill that displays all tickets with their status, title, labels, and progress.

This is the first skill and forces building: the core parsing infrastructure, the CLI scaffold, and the skills directory.

## Acceptance criteria

- [ ] `skills/` directory exists at repo root with one subfolder per skill
- [ ] Skills directory establishes the `SKILL.md` format convention (folder per skill, YAML frontmatter: `name`, `description`)
- [ ] Skill subfolder `skills/tixmd-list/SKILL.md` exists with correct frontmatter
- [ ] Symlink `.claude/skills/tixmd-list` → `skills/tixmd-list` committed for local dev
- [ ] Core: parse ticket files (frontmatter via `@std/front-matter` + `@std/yaml`, body for criteria)
- [ ] Core: Zod schemas for ticket frontmatter validation
- [ ] Core: derive title from first H1
- [ ] Core: derive status from content and dependency graph (spike/blocked/ready/doing/done)
- [ ] Core: derive progress (checked/total acceptance criteria)
- [ ] Core: batch `git log` to get updated dates for all ticket files
- [ ] Core: `filterTickets` pure function with optional criteria (status, labels, done-retention)
- [ ] Core: parse `project.md` frontmatter for config (`done_retention_days`)
- [ ] CLI: `tixmd list` command outputs tickets with status, title, labels, progress
- [ ] CLI: `tixmd list` supports `--status` filter flag
- [ ] Skill calls `tixmd list` and presents results to user
- [ ] Respects `done_retention_days` from project.md config
