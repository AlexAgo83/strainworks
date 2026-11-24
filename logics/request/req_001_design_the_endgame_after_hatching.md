## req_001_design_the_endgame_after_hatching - Design the endgame after hatching
> From version: 0.1.28
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 80%
> Complexity: Medium
> Theme: Game design
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 23:13:26

# AI Context
- Summary: The endgame after stage 6: each hatching purifies its hexagon, opens its harder neighbours and grants one permanent mutation chosen among three; a purified region of seven hexagons is the grand victory.
- Keywords: endgame, hatching, free mode, victory, stage 6, progression
- Use when: designing what happens after the victory screen, or long-term goals across games.
- Skip when: working on stages 1 to 5, buildings or balance before the victory.

# Needs
- After the 10 heavy capsules of stage 6 the game shows the victory screen and goes on in free mode, where every delivery becomes DNA. Nothing new opens at stage 6 except the third reach level at the Laboratory, and free mode has no goal. The operator wants an endgame to be designed, later.

# Context
- Ideas raised on 2026-11-24, not chosen yet:
  - Endless contracts in free mode: the core asks for harder and harder recipes, each tier pays a trophy or a bonus.
  - Planet conquest: clearing every nest of a hex marks it purified on the planet; full victory is a purified region.
  - New cycle: start a new game with a lasting bonus (one more drone, starting DNA) for each successful hatching.
- The threat keeps rising with production in free mode (`menace()`), so a goal there must stay winnable.

# Decision (2026-11-24, operator)
- Planet conquest and new cycle, combined. Endless contracts are not chosen.
- Hatching a strain (stage 6 won) purifies its hexagon on the planet and unlocks the hexagons next to it; a new game can start only on a purified hexagon's neighbour (the first game anywhere, as today).
- Each hatching grants one permanent mutation, chosen among three drawn from a designed pool. It applies to every later game on this planet. Pool examples: one more drone, more starting DNA, a shorter base recipe, a turret already unlocked. Each choice weighs about the same; a mutation taken is not drawn again unless it stacks, and stacking ones have a cap.
- A hexagon is harder the farther it lies from the first purified one, in rings: more enemy families, stronger swarms, poorer deposits. The mutations are what make the next ring winnable.
- Grand victory: a region of seven hexagons purified, one hexagon and its six neighbours (a pentagon's region counts its five). The planet visibly changes colour as hexagons are purified.
- Free mode stays a sandbox after hatching. Its threat keeps rising with production, but the hexagon is purified at the hatching itself, so nothing in free mode can take the purification or the grand victory away.
- Naming: these permanent mutations are the strain's own; the game already calls a creature's gene change a mutation, so the interface says "mutation de souche" where both could meet.

# Acceptance criteria
- AC1: The endgame direction is chosen: planet conquest with a new cycle, its goals (purify hexagons, then a region of seven) and its rewards (one permanent mutation of three per hatching, the planet changing colour, the grand victory).
- AC2: Scope is explicit. In: planet state and purification, the mutation pool and its choice screen, difficulty by ring, the region victory, saves and migration of existing planets. Out: endless contracts, new buildings or enemy kinds, any online or shared planet. Free mode stays as it is.
- AC3: The request is promoted into backlog slices and an orchestration task, with a mockup of the planet screen and of the mutation choice approved by the operator before any implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Saves: existing planets hold games already won; they must count as purified without losing anything, and old games keep playing unchanged.
- Balance: harder rings must stay winnable with the mutations a player can have by then; simulation tests should check the reference game on each ring.
- The free mode threat must never touch the planet state.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/sim/sim.ts` (`STAGES`, `G.won`), `src/game/hud.js` (the victory screen), `src/game/planet.js` and `src/game/saves.js` (the planet and its games list)

# Backlog
- `item_025_keep_the_planet_s_state_and_purify_a_hexagon_at_hatching`
- `item_026_draw_three_strain_mutations_at_each_hatching_and_let_the_player_choose_one`
- `item_027_make_each_ring_of_hexagons_harder_than_the_last`
- `item_028_win_the_game_by_purifying_a_region_of_seven_hexagons`
- `item_029_carry_existing_planets_and_saves_over_to_purification`

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
