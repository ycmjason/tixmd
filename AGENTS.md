# AGENTS.md

## Conventions

1. **Strict TypeScript**: effectively no `any`. Use strict schemas (Zod) for validation.
2. **Biome**: Stick to Biome's defaults for formatting and linting.
3. **Imports**: Use absolute imports or workspace aliases where configured.
4. **Filesystem**:
   * Use `kebab-case` for file names (e.g., `user-profile.tsx`).
   * Colocate tests with source files (e.g., `button.test.tsx` next to `button.tsx`).
5. **Testing**: Write unit tests for logic and component tests for UI.

## Task Completion Requirements

- lefthook should pass

## Core Priorities

1. Readability first.
2. Reliability second.
3. Never "just make it work". NO HACKY-HACKY PATCHY-PATCHY. Your solution must fit into the grander scheme of things. Consult the user before you hack to get around something.

## Code Style & Principles

### Rule of Least Power (RoLP)

> **"Powerful expression inhibits readability."**

* **Avoid Dangling Variables**: Do not create intermediate variables for single-use values or simple chains.
  * ❌ `const handleAction = () => doSomething(...)` -> `<Component onAction={handleAction} />`
  * ✅ `<Component onAction={() => doSomething(...)} />` (Inline simple callbacks)
* **Inline Conditional Computations**: When conditional logic determines what data to include in an object, inline the ternary directly in the spread operator.
  * ❌ `const extra = condition ? { a: 1 } : {}; return { base, ...extra };`
  * ✅ `return { base, ...(condition ? { a: 1 } : {}) };`
* **Inline Types**: Only name types if used multiple times or exported.
* **Destructuring**: Destructure props and objects directly rather than assigning to temporary variables.
* **No Ambiguous Positional Arguments**: Functions with 2+ parameters of the same type (or whose meaning isn't obvious at the call site) should take a single named-fields object instead.
  * ❌ `deriveStatus(progress, dependencies, allTickets)`
  * ✅ `deriveStatus({ progress, dependencies, allTickets })`

### Naming & Exports

* **Named Exports**: Use **Named Exports** for everything (except where default is required by framework).
* **Barrel Exports**: Use `export *` in barrel files (`index.ts`) rather than listing individual exports. This avoids missing exports and reduces maintenance burden.
* **Contextual Component Names**: Domain-specific components should include domain context in their name.
  * ✅ `StoresEmptyState`, `ProductsEmptyState`
  * ❌ `EmptyState` (too generic)

### Declarative Patterns

* **Prefer Declarative Chains**: Use `.map()`, `.filter()` over imperative loops.
* **Iterator Chains**: Prefer native iterator methods (`.values()`, `.map()`, `.toArray()`, `.toSorted()`) over `Array.from()` where available (Node 24+).
  * ✅ `map.values().map(...).toArray().toSorted(...)`
  * ❌ `Array.from(map.values()).map(...).sort(...)`
* **Collection Utilities**: Use standard library (e.g., `Object.groupBy` if available, or native iterator helpers) for declarative operations like `minBy`, `maxBy`, `sumOf`, `groupBy`.
* **Array Creation**: Use `Array.from({ length: N }, () => value)` instead of `Array(N).fill(value)`.

### Functional Core, Imperative Shell

* **Pure logic first**: Keep business logic in pure functions (data in → data out). No side effects, no I/O, no shell calls.
* **Thin I/O wrappers**: Filesystem, git, and other side effects live in a separate thin layer that calls into the pure core.
* **Testability**: Pure functions are trivially testable without mocks. Only the thin shell layer needs integration tests.

### Implementation Notes

* **Eager derivation** — compute all derived fields (title, status, progress, blocks) upfront, not lazily.
* **Batch git log** — get `updated` dates for all ticket files in one call, not per-file.
* **`@std/front-matter` + `@std/yaml`** for YAML frontmatter parsing (not gray-matter). Note: `@std/yaml` coerces ISO 8601 strings to JS Date objects — convert back to string before Zod validation.
* **Zod 4** — use `z.iso.datetime()` (not deprecated `z.string().datetime()`).
* **Index-based criterion checking** — simple and sufficient for solo-dev workflow where criteria don't shift while an agent is working.
* **filterTickets as pure function** — all criteria optional, combine with AND logic. Done-retention is a filter option, not baked into the read path.

### Type Safety

* **Type Aliases**: Use `type` definitions over `interface` for consistency and flexibility (unions, mapped types).
* **Explicit Event Types**: Explicitly annotate event handlers to avoid implicit `any`, especially in inline callbacks.
  * ✅ `onChange={(e: ChangeEvent<HTMLInputElement>) => handlers(e)}`
* **Discriminated Unions**: Use discriminated unions for polymorphic types.
