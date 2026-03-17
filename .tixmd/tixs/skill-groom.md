---
labels: [skills]
dependencies: [skill-list]
created: 2026-03-17T00:00:00Z
---

# /tixmd-groom — groom any ticket

Create the `/tixmd-groom` skill that refines any ticket — elaborating spikes into actionable tixes, or improving criteria on existing tickets.

## Acceptance criteria

- [ ] Skill subfolder `skills/tixmd-groom/SKILL.md` exists with correct frontmatter
- [ ] Symlink `.claude/skills/tixmd-groom` committed
- [ ] Skill auto-detects target ticket from currently open file if it's a `.tixmd/tixs/*.md` file
- [ ] If no ticket detected from context, skill calls `tixmd list` and asks user to pick a ticket
- [ ] For spikes: uses AskUserQuestion to explore options interactively, recommends choices, presents alternatives
- [ ] For spikes: converts spike into actionable ticket with acceptance criteria after discussion
- [ ] For existing actionable tickets: refines or adds acceptance criteria, improves descriptions
- [ ] Skill writes updated ticket content via CLI (or direct file write)
- [ ] Preserves existing frontmatter fields when updating a ticket
