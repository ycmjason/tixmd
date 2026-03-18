---
labels: [skills]
dependencies: [skill-new]
created: 2026-03-17T00:00:00Z
---

# /tixmd-project-spikify — generate spikes from project spec

Create the `/tixmd-project-spikify` skill that reads `project.md` and autonomously generates spike tickets for areas needing exploration.

Depends on skill-new because it reuses the ticket creation infrastructure.

## Acceptance criteria

- [x] Skill subfolder `skills/tixmd-project-spikify/SKILL.md` exists with correct frontmatter
- [x] Symlink `.claude/skills/tixmd-project-spikify` committed
- [x] Skill reads `.tixmd/project.md` to understand project vision, spec, and current state
- [x] Skill reads existing tickets to avoid duplicating spikes that already exist
- [x] Skill autonomously generates spike tickets (title + open questions) for areas needing exploration
- [x] Skill presents all generated spikes to user for review before writing
- [x] User can approve, reject, or edit individual spikes before they're created
- [x] Approved spikes are written via `tixmd new` CLI command
