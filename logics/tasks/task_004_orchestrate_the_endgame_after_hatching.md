## task_004_orchestrate_the_endgame_after_hatching - Orchestrate the endgame after hatching
> From version: 0.2.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-11-25 00:15:00

# AI Context
- Summary: Delivery order of the endgame: planet state, then saves, mutations, rings and the region victory, after the mockups are approved.
- Keywords: orchestrate, endgame, after, hatching
- Use when: planning or checking the endgame work.
- Skip when: implementing one slice: open its item.

# Context
- Coordinate the AC-aware split backlog items without implementing them directly.

# Plan
- [x] 1. Operator approves the planet screen and mutation choice mockups (docs/design/endgame-planet.html, docs/design/endgame-mutations.html); no code before.
- [x] 2. item_025 planet state and purification, with item_029 migration in the same release so no existing planet breaks.
- [x] 3. item_026 mutations pool and choice screen.
- [x] 4. item_027 difficulty by ring, balanced with simulation tests against the mutations reachable by then.
- [x] 5. item_028 region victory.
- [x] 6. Each slice: tests from scratch, commit, push once CI is green, release when the operator asks.
- [x] 7. Audit the running game for concept cards and add the missing ones.

# Backlog
- `item_025_keep_the_planet_s_state_and_purify_a_hexagon_at_hatching`
- `item_026_draw_three_strain_mutations_at_each_hatching_and_let_the_player_choose_one`
- `item_027_make_each_ring_of_hexagons_harder_than_the_last`
- `item_028_win_the_game_by_purifying_a_region_of_seven_hexagons`
- `item_029_carry_existing_planets_and_saves_over_to_purification`

# Definition of Done (DoD)
- [x] Generated backlog slices are linked and ready for implementation.
- [x] Slice ownership and next action are clear.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009 without automatic commits or one commit per micro-step.

# AC Traceability
- request-AC1 -> `item_025_keep_the_planet_s_state_and_purify_a_hexagon_at_hatching`, `item_026_draw_three_strain_mutations_at_each_hatching_and_let_the_player_choose_one`, `item_027_make_each_ring_of_hexagons_harder_than_the_last`, `item_028_win_the_game_by_purifying_a_region_of_seven_hexagons`. Proof deferred to slice closeout.
- request-AC2 -> `item_029_carry_existing_planets_and_saves_over_to_purification`. Proof deferred to slice closeout.
- request-AC3 -> This task. Proof: the split into items 025 to 029 and this task; the mockups in docs/design wait for the operator's approval.

# Validation
- 2026-11-25: targeted browser tests (unlock-card, region, mutations, conquest, language, intro, deposit-limit, pack-warning) green; full `npm run check` run for the 0.2.2 release.
- Finish workflow executed on 2026-11-25.
- Linked backlog/request close verification passed.

# Report
- 2026-11-24: mockups approved (no retroactive mutations, the proposed pool, the real globe). item_025 and item_029 done: planet state, purification at hatching, open neighbours, migration and planet export; the concept cards framework with the Purification card. item_026 done: the six strain mutations, the choice dialog at hatching and on the planet, the Strain mutation card. item_027 done: rings by distance from the first purified hexagon, one more family, bigger swarms and poorer deposits up to ring 3, shown on the planet with the Rings card. item_028 done: the region's progress and missing hexagons on the planet, the grand victory once, the Grande victoire card.
- Finished on 2026-11-25.
- Linked backlog item(s): `item_025_keep_the_planet_s_state_and_purify_a_hexagon_at_hatching`, `item_026_draw_three_strain_mutations_at_each_hatching_and_let_the_player_choose_one`, `item_027_make_each_ring_of_hexagons_harder_than_the_last`, `item_028_win_the_game_by_purifying_a_region_of_seven_hexagons`, `item_029_carry_existing_planets_and_saves_over_to_purification`
- Related request(s): `req_001_design_the_endgame_after_hatching`

- 2026-11-25: the running game's concept cards: base genes and the core's hunger, swarms and the alarm, nests and rich deposits, the stage's mechanic, the harvester cap per deposit and the encapsulator set wrong; each met once at its moment (the cap when a fourth harvester is refused), listed in the help under Concepts, tested in tests/prototype/unlock-card.test.mjs. Shipped with 0.2.2.

# Handoff (2026-11-25, session stopped on the usage limit)
- Done: items 025, 026, 027, 028 and 029, each a committed slice with its tests; the concept cards (Purification, Mutation de souche, Anneaux, Grande victoire) and their help list.
- Not run on the last slice (item_028): the capped full GPU suite. Run it first: targeted tests, lint and typecheck are green.
- Next, operator requirement still open: audit the existing game for concept cards and add the missing ones (base genes and the core's hunger, swarms and the alarm, nests guarding rich deposits and their reward, the stage mechanic requirement, the harvester cap per deposit, the encapsulator warning), each shown the first time it is met and replayable from the help, French with en.js. Then close this task (req_001 closed itself with its last item).
- Local main is ahead of origin/main by the endgame commits (mockups and corpus, then one commit per slice, and merges of origin/main); nothing pushed from this session.

# Links
- Request: `req_001_design_the_endgame_after_hatching`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
