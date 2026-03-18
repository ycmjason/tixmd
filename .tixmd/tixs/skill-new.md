---
labels: [skills]
dependencies: [skill-list]
created: 2026-03-17T00:00:00Z
---

# /tixmd-new — create a new ticket interactively

Create the `/tixmd-new` skill that interactively creates a new ticket file. The skill should guide a lightweight grooming conversation — exploring what the ticket is about, clarifying scope, and fleshing out acceptance criteria with the user — not just collecting raw fields.

## Design decisions

- **CLI input format**: command-line flags (`--title`, `--body`, `--labels`, `--dependencies`). Multi-line body is passed as a single string with `\n`.
- **Filename collision**: error out if a ticket with the same kebab-case ID already exists. User must pick a different title.
- **Dependency validation**: handled in core at read-time (not just in `new`). When `readBoard()` encounters a dependency that doesn't match any existing ticket, it should emit a warning. This benefits all commands, not just `new`.
- **Criteria gathering UX**: the skill should engage the user in a brief grooming-style conversation — ask what the ticket is about, explore the scope, then collaboratively define acceptance criteria. Not just "give me your criteria". But don't over-groom — just enough to clarify what the tix is and what done looks like.

## Acceptance criteria

- [x] Skill subfolder `skills/tixmd-new/SKILL.md` exists with correct frontmatter
- [x] Symlink `.claude/skills/tixmd-new` committed
- [x] Skill gathers title, description, labels, and dependencies through a grooming conversation with the user (using AskUserQuestion)
- [x] Skill explores the ticket scope with the user and collaboratively defines acceptance criteria (for non-spikes)
- [x] Skill determines whether the ticket is a spike (no AC) or actionable (has AC) based on the conversation
- [x] Skill calls `tixmd new` CLI command to write the file
- [x] Core: function to generate ticket markdown from structured input (title, body, frontmatter fields)
- [x] Core: function to derive kebab-case filename from title
- [x] CLI: `tixmd new` command accepts `--title`, `--body`, `--labels`, `--dependencies` flags and writes `.tixmd/tixs/<id>.md`
- [x] CLI: `tixmd new` errors if a ticket file with the derived ID already exists
- [x] Core: `readBoard()` warns when a ticket references a dependency ID that doesn't exist
- [x] Generated file has correct frontmatter (labels, dependencies, created timestamp)
