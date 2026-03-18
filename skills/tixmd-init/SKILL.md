---
name: tixmd-init
description: Initialize a tixmd project by interactively gathering project context and generating .tixmd/project.md. Use when setting up tixmd in a new repo.
---

# /tixmd-init

Initialize a tixmd project through an interactive conversation.

## Instructions

1. Check if `.tixmd/` already exists. If it does, inform the user and stop.

2. Ask the user about their project to build context for `project.md`:
   - What is the project? (name, one-line description)
   - What problem does it solve or who is it for?
   - What's the tech stack? (language, frameworks, key libraries)
   - Any core principles or constraints to keep in mind?

3. Ask the user about their **project conventions**. These conventions guide how tixmd skills behave (e.g. how tickets are scoped, how work is committed). For each, explain what it means and suggest a sensible default:

   - **Ticket style** — how should tickets be scoped?
     - Default: "vertical slices" (each ticket delivers user-facing value end-to-end)
     - Alternative: "horizontal" (layer-by-layer, e.g. "build API", "build UI")
   - **Commit strategy** — how should work be committed during a ticket?
     - Default: "one commit per criterion" (each checked-off criterion gets its own commit with code + ticket progress)
     - Alternatives: "squash per ticket", "up to the developer"
   - **Definition of done** — what qualifies a ticket as done beyond all criteria checked?
     - Default: "all acceptance criteria checked"
     - Examples: "linter/formatter passes", "tests pass", "PR reviewed"

   Let the user accept defaults or customize. Keep it conversational — don't overwhelm.

4. From the conversation, draft a `project.md` body covering:
   - **Who is this for** — target users/audience
   - **Core principles** — guiding design/engineering principles
   - **Tech stack** — languages, frameworks, tools
   - **Conventions** — the ticket style, commit strategy, and definition of done agreed upon
   - Any other relevant context the user mentioned

4. Present the draft to the user for review. Let them approve or request edits.

5. Once approved, create the project via CLI:

```bash
npx tixmd init --title "<project name>" --body "<body>"
```

Use `\n` for newlines in `--body`.

6. Confirm the project was initialized and suggest next steps:
   - Use `/tixmd-project-spikify` to generate initial spike tickets from the project spec
   - Use `/tixmd-new` to create individual tickets
