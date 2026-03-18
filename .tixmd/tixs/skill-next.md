---
labels: [skills]
dependencies: [skill-list]
created: 2026-03-17T00:00:00Z
---

# /tixmd-next — pick and work on the next best ticket

Create the `/tixmd-next` skill that selects the best ready ticket and orchestrates the full work loop: work on criterion, check it off, commit, repeat.

This is the most complex skill — it fully orchestrates the agent's workflow.

## Acceptance criteria

- [ ] Skill subfolder `skills/tixmd-next/SKILL.md` exists with correct frontmatter
- [ ] Symlink `.claude/skills/tixmd-next` committed
- [ ] Skill reads `.tixmd/project.md` for project context and conventions
- [ ] Skill calls `tixmd list --status ready` to find candidate tickets
- [ ] Skill picks the best candidate by reading `project.md` and selecting the ticket most relevant to the project's current goals
- [ ] Skill shows the selected ticket to user and waits for confirmation before starting
- [ ] After confirmation, skill orchestrates the work loop:
  - [ ] Read the ticket's acceptance criteria
  - [ ] Work on the next unchecked criterion
  - [ ] Check off the criterion in the ticket file (direct edit of `- [ ]` → `- [x]`)
  - [ ] Repeat until all criteria are checked
