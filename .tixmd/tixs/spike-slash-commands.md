# Spike: Claude Code slash commands — RESOLVED

## Decisions

- **Skill set** (7 skills):
  | Skill | Purpose |
  |---|---|
  | `/tixmd-init` | Interactive project initialization — ask about the project, generate `.tixmd/project.md` |
  | `/tixmd-project-spikify` | Read `project.md`, autonomously generate spike tickets, review before writing |
  | `/tixmd-groom` | Groom any ticket — elaborate spikes into actionable tixes, or refine criteria on existing tickets. Auto-detects from open file, otherwise asks user to pick |
  | `/tixmd-list` | List all tickets with status, title, labels, progress |
  | `/tixmd-new` | Create a new ticket interactively |
  | `/tixmd-next` | Pick best ready ticket, confirm with user, then fully orchestrate: work → check criterion → commit → repeat |
  | `/tixmd-current` | Show ticket(s) currently in `doing` status |

- **Skills location**: root `skills/` directory, one subfolder per skill with a `SKILL.md`
- **Installation**: `npx skills add ./skills` (local dev via symlinks in `.claude/skills/`)
- **Architecture**: skills → CLI (`tixmd` commands via Bash) → `@tixmd/core`
- **MCP**: dropped for now. Skills + CLI cover the Claude Code workflow. MCP can be added later for non-Claude agents.
- **Skills format**: folder with `SKILL.md` (YAML frontmatter: `name`, `description`) + markdown instructions. Compliant with [skills.sh](https://skills.sh/) spec.
- **Naming convention**: `tixmd-<domain>-<action>` where domain is optional (e.g. `tixmd-project-spikify`, `tixmd-groom`). Names must be lowercase + hyphens only per skills.sh spec.

## Skill UX details

### `/tixmd-init`
- Interactive: ask about the project vision, goals, tech stack, team size
- Generate a full `project.md` with vision, principles, and config
- Create `.tixmd/` directory and `tixs/` subdirectory

### `/tixmd-project-spikify`
- Read `.tixmd/project.md` to understand project vision and spec
- Autonomously generate spike tickets for areas that need exploration
- Present generated spikes for user review before writing files

### `/tixmd-groom`
- Auto-detect target ticket from currently open file (if it's a `.tixmd/tixs/*.md` file), otherwise ask user to pick
- Works on any ticket status:
  - **Spikes**: interactive questions (AskUserQuestion) to explore options, recommend choices, present alternatives, then convert to actionable ticket with acceptance criteria
  - **Existing tickets**: refine criteria, add missing acceptance criteria, improve descriptions
- Interactive: recommend options but present alternatives with enough context for user to decide

### `/tixmd-list`
- Show all tickets with status, title, labels
- Respects `done_retention_days` filtering from config

### `/tixmd-new`
- Interactive: ask for title, description, labels, dependencies
- Write the `.md` file to `.tixmd/tixs/`

### `/tixmd-next`
- Query ready tickets, pick the best candidate (consider dependencies, age, priority)
- Show the ticket to user, confirm before starting
- **Full orchestration loop**: work on criterion → check it off → commit (code + ticket in same commit) → next criterion → repeat until done
- One commit per criterion checked off

### `/tixmd-current`
- Show ticket(s) with `doing` status (some criteria checked, not all)
- Display progress (checked/total criteria)
