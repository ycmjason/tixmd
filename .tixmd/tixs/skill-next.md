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
- [ ] Skill calls `tixmd list --status ready` to find candidate tickets
- [ ] Skill picks the best candidate (considering age, dependencies, priority)
- [ ] Skill shows the selected ticket to user and waits for confirmation before starting
- [ ] After confirmation, skill orchestrates the work loop:
  - [ ] Read the ticket's acceptance criteria
  - [ ] Work on the next unchecked criterion
  - [ ] Check off the criterion in the ticket file (via `tixmd check` or direct edit)
  - [ ] Commit both code changes and ticket progress in one commit
  - [ ] Repeat until all criteria are checked
- [ ] Core: function to check off a criterion by index in a ticket file
- [ ] CLI: `tixmd check <ticket-id> <criterion-index>` command
- [ ] One commit per criterion (code + updated ticket file together)
