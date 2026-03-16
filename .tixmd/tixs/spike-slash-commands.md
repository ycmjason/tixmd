# Spike: Claude Code slash commands — RESOLVED

## Decisions

- **Command set**: `spikify`, `elaborate`, `list`, `next`
- **Package**: `@tixmd/skills` in the monorepo, one subfolder per skill with a `SKILL.md`
- **Installation**: `npx skills add @tixmd/skills` (local dev: `npx skills add ./packages/@tixmd/skills`)
- **Architecture**: skills → CLI (`tix` commands via Bash) → `@tixmd/core`
- **MCP**: dropped for now. Skills + CLI cover the Claude Code workflow. MCP can be added later for non-Claude agents.
- **spikify UX**: autonomous generation, then review before writing
- **elaborate UX**: interactive questions (AskUserQuestion), recommend options, present alternatives
- **next UX**: pick best ready ticket, show it, confirm before starting
- **list UX**: show all tickets with status, title, labels
- **Skills format**: folder with `SKILL.md` (YAML frontmatter: `name`, `description`) + markdown instructions
