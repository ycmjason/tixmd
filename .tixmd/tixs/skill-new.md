---
labels: [skills]
dependencies: [skill-list]
created: 2026-03-17T00:00:00Z
---

# /tixmd-new — create a new ticket interactively

Create the `/tixmd-new` skill that interactively creates a new ticket file.

## Acceptance criteria

- [ ] Skill subfolder `skills/tixmd-new/SKILL.md` exists with correct frontmatter
- [ ] Symlink `.claude/skills/tixmd-new` committed
- [ ] Skill uses AskUserQuestion to gather title, description, labels, and dependencies
- [ ] Skill determines whether the ticket is a spike or actionable (has acceptance criteria)
- [ ] Skill calls `tixmd new` CLI command to write the file
- [ ] Core: function to generate ticket markdown from structured input (title, body, frontmatter fields)
- [ ] Core: function to derive kebab-case filename from title
- [ ] CLI: `tixmd new` command accepts structured input and writes `.tixmd/tixs/<id>.md`
- [ ] Generated file has correct frontmatter (labels, dependencies, created timestamp)
