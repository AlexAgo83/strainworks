## item_027_make_each_ring_of_hexagons_harder_than_the_last - Make each ring of hexagons harder than the last
> From version: 0.2.0
> Schema version: 1.0
> Status: Done
> Understanding: 85%
> Confidence: 75%
> Progress: 100%
> Complexity: High
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-25 02:17:50

# AI Context
- Summary: Hexagons farther from the first purified one are harder: more enemy families, stronger swarms, poorer deposits.
- Keywords: each, ring, hexagons, harder, than, last
- Use when: changing how a hexagon's ring sets a new game's difficulty.
- Skip when: balance inside one game that does not depend on the hexagon.

# Problem
Every hexagon would play the same, so purifying more of the planet would add length, not challenge.

# Scope
- In:
  - A ring per hexagon: its distance in steps from the planet's first purified hexagon.
  - A new game reads its ring at start: more enemy families, stronger and earlier swarms, poorer deposits, each step bounded.
  - The planet screen shows each open hexagon's ring and what it changes, in a few words.
- Out:
  - New enemy kinds.
  - Changing a game already started when the ring would change.

# Acceptance criteria
- AC1: Ring 0 plays as today; each ring raises families, swarm strength and lowers deposit richness, checked by simulation tests.
- AC2: The reference game stays winnable on rings 1 to 3 with the mutations a player can hold by then, checked by simulation.
- AC3: An open hexagon shows its ring and its changes on the planet screen.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: `tests/sim/rings.test.ts`, `tests/prototype/conquest.test.mjs`

# Implementation notes (2026-11-25)
- `RING` and `applyRing` in `src/sim/sim.ts`: a hexagon's ring is its distance in steps from the planet's first purified hexagon (`ringOfHex` in `src/game/conquest.js`, across the globe's neighbours). Each ring up to the third brings one more enemy family from the start (never one of the game's base genes, within the families cap), swarms 25 % bigger (within the swarm cap) and deposits 10 % poorer; past the third, the same as the third. Ring 0 plays as before. The game keeps its ring (`G.ring`).
- The planet's panel for an open hexagon says its ring and what it changes; the first open hexagon of ring 1 or more shows the Rings concept card (not while a mutation is still to choose).
- AC2, with its boundary: the reference game reaches stage 4 on rings 1 to 3 (`tests/sim/rings.test.ts`); its player model kills what comes, so this proves the stages still open, not that the bigger fights are won. The reference game moved to `tests/sim/reference-game.ts` so other simulation tests can replay it.
- Proof: `tests/sim/rings.test.ts`, `tests/prototype/conquest.test.mjs` (the ring on the planet and in the new game).

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_001_design_the_endgame_after_hatching`
- Primary task(s): `task_004_orchestrate_the_endgame_after_hatching`

# Priority
- Priority: Medium
- Rationale: Follows item_025 in the order of task_004.

# Notes
- Hybrid rationale: Derived from request `req_001_design_the_endgame_after_hatching` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_001_design_the_endgame_after_hatching.md`.
- Generated locally by logics-manager.
- Task `task_004_orchestrate_the_endgame_after_hatching` was finished via `logics-manager flow finish task` on 2026-11-25.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |


# Tasks
- `task_004_orchestrate_the_endgame_after_hatching`
