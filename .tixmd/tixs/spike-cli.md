# Spike: CLI design

What does `tix` look like as a command-line tool?

## Questions to answer

- What commands do we need for v1? `init`, `list`, `new`, `check`? What else?
- Which CLI framework? `commander`, `citty`, or Node 24's built-in `parseArgs`?
- What does human-friendly output look like? Colored tables? Minimal text? Grouped by status?
- Should every command support `--json` for machine consumption, or is that what MCP is for?
- Package name: `tixmd` (global) or `@tixmd/cli` (scoped)? Binary name: `tix`?
- How does the CLI find `.tixmd/`? Walk up from cwd?
