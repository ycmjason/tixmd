---
name: tixmd-current
description: Show tickets currently in progress (doing status). Use when the user wants to see what they're working on, check progress on active tickets, or resume work.
---

# /tixmd-current

Show all tickets currently in progress.

## Instructions

1. Run the `tixmd list` CLI command filtered to doing tickets:

```bash
npx tixmd list --status doing
```

2. If no doing tickets are found, let the user know there's nothing in progress and suggest:
   - Use `/tixmd-list` to see available tickets
   - Use `/tixmd-next` to pick the next ticket to work on

3. For each doing ticket, read the ticket file from `.tixmd/tixs/<ticket-id>.md` to get full details.

4. Present each doing ticket with:
   - **Title** and **ticket ID**
   - **Labels**
   - **Progress** (e.g. 2/5 criteria checked)
   - **Criteria breakdown**: show each criterion with its checked/unchecked state
     - `[x]` for completed criteria
     - `[ ]` for remaining criteria

5. If there are multiple doing tickets, present them in a list. Highlight which criteria are still remaining so the user can quickly resume work.
