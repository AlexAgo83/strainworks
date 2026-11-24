## req_002_modularize_the_single_file_prototype - Modularize the single-file prototype
> From version: 0.1.38
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: modularize, single, file, prototype
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Needs
- Split the game out of one 9,500-line page into ES modules and TypeScript, through the Vite already installed, with no UI framework.
- Keep the game the player sees unchanged and the 92 existing browser tests green at every step.
- Bring all game code under the linter and the type checker, and stop pinning the Babylon CDN by hand.
- Track progress step by step; the operator implements every step in operator sessions, not missions.

# Context
- Audit of 2026-11-24 on 0.1.38: prototype/index.html is 9,500 lines and 680 KB: about 1,040 lines of CSS, an inline base64 sprite sheet, an 870-line English dictionary and about 7,000 lines of one global script (387 functions, 305 top-level let/const, mutable state G, ui, NET, cam).
- Biome lints src, tests, scripts and site; tsc checks src only, which holds a declaration file and fr.json: the game code is neither linted nor typed.
- 41 distinct hand-written lists of building types stand for traits (produces, turns, listens to a nerve, wears a rank ring); adding a building means finding each one.
- 20 empty catch blocks; some guard browser storage, others may hide bugs.
- 92 Playwright tests drive the game through its globals (put, step, G), one file at a time; CI takes about 5 minutes; there is no fast unit test of the simulation.
- The Babylon CDN version and SRI hash are written by hand in index.html: the Dependabot bump to 9.37.1 broke every 3D test until both were updated.
- Measured on the 591-building demo in headless Chromium without a GPU: 2.5 ms a simulation step, 25 ms a 2D frame drawn in software; device measurements come before any optimization.
- The simulation split (step 3) is item_002_port_the_simulation_with_equal_behavior, already ready under req_000; this request orders it among the other steps.

# Acceptance criteria
- AC1: The CSS, the English dictionary and the sprite sheet live in their own files, and index.html holds markup and the game script only.
- AC2: One building trait table replaces the hand-written type lists, and adding a building touches that table instead of scattered lists.
- AC3: The game script is split into ES modules under src (render, interface, planet, audio, saves) served by Vite, with a small window API the existing tests use.
- AC4: Biome and tsc cover all game code, the Babylon CDN pin is generated from the installed package at build, and every empty catch is either justified in a comment or removed.
- AC5: Every step keeps the 92 existing tests green and the game the player sees unchanged, checked on the demo base.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_002_modularize_the_single_file_prototype`
- Architecture decision(s): (none yet)

# References
- prototype/index.html
- prototype/view3d.js
- vite.config.mjs
- tsconfig.json
- biome.json
- logics/backlog/item_002_port_the_simulation_with_equal_behavior.md

# Backlog
- `item_004_move_the_css_the_english_dictionary_and_the_sprite_sheet_out_of_the_page`
- `item_005_replace_the_building_type_lists_with_one_trait_table`
- `item_006_split_the_game_script_into_es_modules`
- `item_007_lint_and_type_all_game_code_and_generate_the_babylon_cdn_pin`

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |

