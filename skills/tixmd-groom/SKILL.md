---
name: tixmd-groom
description: Groom and refine a tixmd ticket. Converts spikes into actionable tickets with acceptance criteria, or improves existing tickets. Use when the user wants to refine, elaborate, or improve a ticket.
---

# /tixmd-groom

Refine any ticket — elaborate spikes into actionable tickets, or improve criteria on existing ones.

## Instructions

1. **Detect the target ticket** using the first match:
   - If args were passed (e.g. `/tixmd-groom spike-cli`), use that as the ticket ID
   - If the user has a `.tixmd/tixs/*.md` file open in their IDE (check `ide_opened_file` context), use that ticket
   - Otherwise, run `npx tixmd list` and ask the user which ticket to groom

2. **Read the ticket file** from `.tixmd/tixs/<ticket-id>.md` to understand its current state.

3. **Branch based on ticket type:**

### For spikes (no acceptance criteria)

- Read `.tixmd/project.md` for project context
- Ask the user exploratory questions to understand what this spike is about:
  - What are the options or approaches?
  - What constraints or requirements exist?
  - What are the key tradeoffs?
- Recommend an approach, but present alternatives with enough context for the user to decide
- Once the direction is clear, propose acceptance criteria that define "done"
- Present the refined ticket (title, description, criteria) for user review
- After approval, edit the ticket file directly:
  - Keep the existing frontmatter (labels, dependencies, created)
  - Update the body with the refined description and acceptance criteria

### For actionable tickets (has acceptance criteria)

- Discuss with the user what needs refinement:
  - Are criteria clear and verifiable?
  - Is anything missing?
  - Should the scope be adjusted?
- Propose changes and get user approval
- Edit the ticket file directly, preserving existing frontmatter

4. **When editing the ticket file**, always preserve existing YAML frontmatter fields. Only modify the markdown body (title, description, criteria).

5. Confirm the changes and show the updated ticket.
