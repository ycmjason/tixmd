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

3. From the conversation, draft a `project.md` body covering:
   - **Who is this for** — target users/audience
   - **Core principles** — guiding design/engineering principles
   - **Tech stack** — languages, frameworks, tools
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
