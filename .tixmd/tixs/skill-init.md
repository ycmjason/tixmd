---
labels: [skills]
dependencies: [skill-list]
created: 2026-03-17T00:00:00Z
---

# /tixmd-init — interactive project initialization

Create the `/tixmd-init` skill that initializes a tixmd project by interactively generating `.tixmd/project.md`.

## Acceptance criteria

- [x] Skill subfolder `skills/tixmd-init/SKILL.md` exists with correct frontmatter
- [x] Symlink `.claude/skills/tixmd-init` committed
- [x] Skill uses AskUserQuestion to gather project vision, goals, tech stack, and team context
- [x] Skill generates a `project.md` with vision, principles, and frontmatter config
- [x] Skill creates `.tixmd/` directory and `tixs/` subdirectory if they don't exist
- [x] Skill calls `tixmd init` CLI command (via Bash) to write the file
- [x] Core: `@tixmd/core` exposes a function to scaffold the `.tixmd/` directory and write `project.md`
- [x] CLI: `tixmd init` command wraps the core function
