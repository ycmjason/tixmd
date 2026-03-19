---
groomed_tickets: [skill-groom, skill-init, skill-list, skill-new, skill-next, skill-project-spikify]
created: 2026-03-01T00:00:00Z
---

# Spike: Claude Code slash commands

What should the tixmd Claude Code skill set look like?

## Decisions

- **Skill set** (6 skills):
  | Skill | Purpose |
  |---|---|
  | `/tixmd-init` | Interactive project initialization — ask about the project, generate `.tixmd/project.md` |
  | `/tixmd-project-spikify` | Read `project.md`, autonomously generate spike tickets, review before writing |
  | `/tixmd-groom` | Groom any ticket — elaborate spikes into actionable tixes, or refine criteria on existing tickets |
  | `/tixmd-list` | List all tickets with status, title, labels, progress |
  | `/tixmd-new` | Create a new ticket interactively |
  | `/tixmd-next` | Pick best ready ticket, confirm with user, then fully orchestrate: work → check criterion → commit → repeat |

- **Skills location**: root `skills/` directory, one subfolder per skill with a `SKILL.md`
- **Architecture**: skills → CLI (`tixmd` commands via Bash) → `@tixmd/core`
- **MCP**: dropped for now. Skills + CLI cover the Claude Code workflow.
- **Skills format**: folder with `SKILL.md` (YAML frontmatter: `name`, `description`) + markdown instructions. Compliant with [skills.sh](https://skills.sh/) spec.
