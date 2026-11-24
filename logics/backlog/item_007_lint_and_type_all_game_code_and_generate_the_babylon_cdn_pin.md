## item_007_lint_and_type_all_game_code_and_generate_the_babylon_cdn_pin - Lint and type all game code, and generate the Babylon CDN pin
> From version: 0.1.38
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 80%
> Complexity: Medium
> Theme: Quality
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 18:25:45

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: lint, type, all, game, code, generate, babylon, cdn, pin
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- The game code escapes Biome and tsc, the CDN pin is copied by hand, and empty catch blocks may hide failures.

# Scope
- In:
  - Biome and tsc on all of src and the remaining prototype scripts in npm run check.
  - The Babylon CDN URL and SRI hash derived from the installed babylonjs package at build.
  - Each empty catch justified in a one-line comment or replaced by real handling.
- Out:
  - A rewrite of working code for style alone.

# Acceptance criteria
- AC1: npm run check lints and typechecks every game module.
- AC2: Bumping babylonjs needs no manual edit for the 3D tests to pass.
- AC3: No empty catch remains without a comment saying why.

# Implementation notes (2026-11-24)
- Done: the Babylon CDN address and SRI hash are written at build from the installed babylonjs package (`scripts/babylon-pin.mjs`, used by `vite.config.mjs` in dev and by `scripts/bundle-game.mjs` for the site and the tests). Bumping babylonjs needs no other edit.
- Done: each of the 20 empty catch blocks says why in a one-line comment (blocked or full storage, a pointer already gone, a browser without an audio session, an unreadable save).
- Left: typing and linting the game code. `src/sim/sim.ts` starts with `@ts-nocheck` and is left out of Biome (131 lint errors at the move); `src/game/*.js` is neither linted nor type-checked. Typing them under the strict tsconfig is the remaining work of this item: measured on 2026-11-24, removing `@ts-nocheck` from `sim.ts` alone gives 761 errors (493 implicit any parameters, 116 assignments to functions from `simSet`), before the 10 interface modules.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: npm run check lints and typechecks every game module.
- request-AC5 -> This backlog slice. Proof: AC2: Bumping babylonjs needs no manual edit for the 3D tests to pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_002_modularize_the_single_file_prototype`
- Architecture decision(s): (none yet)
- Request: `req_002_modularize_the_single_file_prototype`
- Primary task(s): `task_002_orchestrate_the_modularization_of_the_prototype`

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
