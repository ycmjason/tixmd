---
name: tixmd-new
description: Interactively create a new tixmd ticket through a lightweight grooming conversation. Explores scope, clarifies acceptance criteria, and writes the ticket file.
---

# /tixmd-new

Create a new ticket on the tixmd board through a guided grooming conversation.

## Instructions

1. Run `npx tixmd list` to see the current board state (existing tickets, labels, dependencies).

2. Ask the user what the ticket is about. Have a brief grooming conversation to explore scope:
   - What problem does this solve or what capability does it add?
   - Is the scope clear enough to define "done", or is this more of a spike/exploration?
   - Are there any existing tickets this depends on or relates to?

3. Based on the conversation, determine if this is:
   - A **spike** — needs exploration, no clear acceptance criteria yet
   - An **actionable ticket** — scope is clear enough to define acceptance criteria

4. For actionable tickets, collaboratively define acceptance criteria with the user:
   - Propose initial criteria based on the discussion
   - Ask if anything is missing or should be adjusted
   - Keep criteria concrete and verifiable
   - Don't over-groom — just enough to clarify what the ticket is and what "done" looks like

5. Gather the remaining fields:
   - **Title**: a concise, descriptive title
   - **Labels**: relevant labels (look at existing tickets for label conventions)
   - **Dependencies**: IDs of tickets that must be done first (reference the board)

6. Construct the body. For actionable tickets:

   ```
   <description>

   ## Acceptance criteria

   - [ ] First criterion
   - [ ] Second criterion
   ```

   For spikes, just the description and open questions.

7. Create the ticket:

   ```bash
   npx tixmd new --title "<title>" --body "<body>" --labels "<comma-separated>" --dependencies "<comma-separated>"
   ```

   Use `\n` for newlines in `--body`. Omit `--labels` and `--dependencies` if empty.

8. If the command errors due to a filename collision, inform the user and ask for an alternative title.

9. Confirm the ticket was created and show the derived ticket ID.
