## item_007_lint_and_type_all_game_code_and_generate_the_babylon_cdn_pin - Lint and type all game code, and generate the Babylon CDN pin
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Quality
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 22:58:32

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
- Done, loose first (operator decision 2026-11-24): `npm run check` lints and type-checks all game code. `tsconfig.game.json` checks `src/sim` and `src/game` (JavaScript included) without `strict` and with implicit any allowed; `src/game/env.d.ts` declares what the page gives (the English dictionary, the build-time engine pin, the window's own globals). Biome lints the same files, with the rules the old code breaks everywhere turned off for them only (`overrides` in `biome.json`). The strict root `tsconfig.json` stays the target and excludes them for now.
- `sim.ts` no longer has `@ts-nocheck`: a few `any` annotations made it pass. 34 lines of the interface carry `// @ts-expect-error: loose typing, tightened module by module (item_007)`.
- Typing surfaced two bugs from the trait table (step 2): two listener checks read `hasTrait(type), 'listen'`, always true. Fixed.
- Tightening path, one module at a time, each its own commit with the browser suite green:
  1. `src/sim/text.ts`, `hooks.ts`: already strict.
  2. `src/sim/sim.ts`: give the cell, the game and the item their types (one loose `Cell` interface with optional fields per kind), remove the `any` annotations, then move it under the strict root tsconfig.
  3. `src/game/saves.js`, `keys.js`, `audio.js`: small, few DOM casts; convert to `.ts`.
  4. `src/game/render.js`, `view.js`, `planet.js`: canvas and WebGL types.
  5. `src/game/actions.js`, `input.js`, `hud.js`, `lab.js`, `main.js`: remove each `@ts-expect-error` by narrowing the DOM element or event target.
  6. When a file is strict, take it out of the `biome.json` override; when all are, delete `tsconfig.game.json` and the override.

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

# Notes
- Task `task_002_orchestrate_the_modularization_of_the_prototype` was finished via `logics-manager flow finish task` on 2026-11-24.
