## task_002_orchestrate_the_modularization_of_the_prototype - Orchestrate the modularization of the prototype
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-11-24 22:58:33

# AI Context
- Summary: The five modularization steps, done and proven by their commits.
- Keywords: orchestrate, modularization, prototype
- Use when: checking how and in which commits the prototype was split.
- Skip when: new gameplay work.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Step 1: move the CSS, the EN dictionary and the sprite sheet out of index.html; run the full suite; commit.
- [ ] 2. Step 2: replace the type lists with the trait table; run the full suite; commit.
- [ ] 3. Step 3: run item_002_port_the_simulation_with_equal_behavior: src/sim in TypeScript without DOM or renderer, with fast Node unit tests; commit.
- [ ] 4. Step 4: split the remaining script into src modules behind a window test API; check the demo base on screen; commit.
- [ ] 5. Step 5: Biome and tsc on all game code, generated Babylon CDN pin, empty catches reviewed; commit.
- [ ] 6. After each step: record progress in this task, push to main once CI is green, and release only when the operator asks.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_004_move_the_css_the_english_dictionary_and_the_sprite_sheet_out_of_the_page`
- `item_005_replace_the_building_type_lists_with_one_trait_table`
- `item_006_split_the_game_script_into_es_modules`
- `item_007_lint_and_type_all_game_code_and_generate_the_babylon_cdn_pin`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_004_move_the_css_the_english_dictionary_and_the_sprite_sheet_out_of_the_page`. Proof: commit cdd432c moved the stylesheet, the model sheet and the English text out of index.html; tests/site.test.mjs plays the built site offline.
- request-AC5 -> `item_004_move_the_css_the_english_dictionary_and_the_sprite_sheet_out_of_the_page`. Proof: each step kept the browser and simulation suites green in CI on its commit, cdd432c to 25d2fa3, with the demo base unchanged.
- request-AC2 -> `item_005_replace_the_building_type_lists_with_one_trait_table`. Proof: commit e49abc6 declares building traits in one table (TRAITS in src/sim/sim.ts); tests/prototype/kinds.test.mjs checks every type declares its traits.
- request-AC5 -> `item_005_replace_the_building_type_lists_with_one_trait_table`. Proof: each step kept the browser and simulation suites green in CI on its commit, cdd432c to 25d2fa3, with the demo base unchanged.
- request-AC3 -> `item_006_split_the_game_script_into_es_modules`. Proof: commits 4f1121f and 533be40 run the game as ES modules under src (src/sim, src/game) through Vite; the browser tests reach it through the window API in src/game/main.js.
- request-AC5 -> `item_006_split_the_game_script_into_es_modules`. Proof: each step kept the browser and simulation suites green in CI on its commit, cdd432c to 25d2fa3, with the demo base unchanged.
- request-AC4 -> `item_007_lint_and_type_all_game_code_and_generate_the_babylon_cdn_pin`. Proof: commits 2ad5921 (scripts/babylon-pin.mjs writes the pin at build, empty catches justified) and 25d2fa3 (the lint and typecheck scripts cover all game code).
- request-AC5 -> `item_007_lint_and_type_all_game_code_and_generate_the_babylon_cdn_pin`. Proof: each step kept the browser and simulation suites green in CI on its commit, cdd432c to 25d2fa3, with the demo base unchanged.

# Validation
- Vitest, Biome lint and tsc green on 25d2fa3; items 004 to 007 closed with their proofs.
- Finish workflow executed on 2026-11-24.
- Linked backlog/request close verification passed.

# Report
- Done in five steps (cdd432c, e49abc6, 4f1121f, 533be40, 2ad5921, 25d2fa3), each recorded in its backlog item.
- Finished on 2026-11-24.
- Linked backlog item(s): `item_004_move_the_css_the_english_dictionary_and_the_sprite_sheet_out_of_the_page`, `item_005_replace_the_building_type_lists_with_one_trait_table`, `item_006_split_the_game_script_into_es_modules`, `item_007_lint_and_type_all_game_code_and_generate_the_babylon_cdn_pin`
- Related request(s): `req_002_modularize_the_single_file_prototype`

# Links
- Request: `req_002_modularize_the_single_file_prototype`
- Product brief(s): `prod_002_modularize_the_single_file_prototype`
- Architecture decision(s): (none yet)

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
