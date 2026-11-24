## task_004_orchestrate_the_endgame_after_hatching - Orchestrate the endgame after hatching
> From version: 0.2.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 40%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-11-24 23:38:24

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
- [ ] 3. item_026 mutations pool and choice screen.
- [ ] 4. item_027 difficulty by ring, balanced with simulation tests against the mutations reachable by then.
- [ ] 5. item_028 region victory.
- [ ] 6. Each slice: tests from scratch, commit, push once CI is green, release when the operator asks.

# Backlog
- `item_025_keep_the_planet_s_state_and_purify_a_hexagon_at_hatching`
- `item_026_draw_three_strain_mutations_at_each_hatching_and_let_the_player_choose_one`
- `item_027_make_each_ring_of_hexagons_harder_than_the_last`
- `item_028_win_the_game_by_purifying_a_region_of_seven_hexagons`
- `item_029_carry_existing_planets_and_saves_over_to_purification`

# Definition of Done (DoD)
- [ ] Generated backlog slices are linked and ready for implementation.
- [ ] Slice ownership and next action are clear.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009 without automatic commits or one commit per micro-step.

# AC Traceability
- request-AC1 -> `item_025_keep_the_planet_s_state_and_purify_a_hexagon_at_hatching`, `item_026_draw_three_strain_mutations_at_each_hatching_and_let_the_player_choose_one`, `item_027_make_each_ring_of_hexagons_harder_than_the_last`, `item_028_win_the_game_by_purifying_a_region_of_seven_hexagons`. Proof deferred to slice closeout.
- request-AC2 -> `item_029_carry_existing_planets_and_saves_over_to_purification`. Proof deferred to slice closeout.
- request-AC3 -> This task. Proof: the split into items 025 to 029 and this task; the mockups in docs/design wait for the operator's approval.

# Validation
- (no validation recorded yet)

# Report
- 2026-11-24: mockups approved (no retroactive mutations, the proposed pool, the real globe). item_025 and item_029 done: planet state, purification at hatching, open neighbours, migration and planet export; the concept cards framework with the Purification card.

# Links
- Request: `req_001_design_the_endgame_after_hatching`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
