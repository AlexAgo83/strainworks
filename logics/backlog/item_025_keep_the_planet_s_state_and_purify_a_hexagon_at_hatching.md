## item_025_keep_the_planet_s_state_and_purify_a_hexagon_at_hatching - Keep the planet's state and purify a hexagon at hatching
> From version: 0.2.0
> Schema version: 1.0
> Status: Ready
> Understanding: 85%
> Confidence: 75%
> Progress: 0%
> Complexity: High
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: The planet keeps which hexagons are purified and which are open; a hatching purifies its hexagon and opens its neighbours.
- Keywords: planet, state, purify, hexagon, hatching
- Use when: changing what the planet stores, where a new game may start, or how purification shows.
- Skip when: the mutations, the difficulty of a ring or the region victory: their own items.

# Problem
A won game changes nothing on the planet: every hexagon stays the same and a new game can start anywhere, so hatching leads nowhere.

# Scope
- In:
  - A planet state beside the games list: purified hexagons with the hatching time, open hexagons, the first hexagon.
  - A hatching (stage 6 won) purifies the game's hexagon at that moment and opens its neighbours; free mode afterwards never changes it.
  - A new game starts on an open hexagon; the first game of a planet starts anywhere, as today.
  - The planet screen draws purified hexagons in a living colour, open ones outlined, locked ones dim, the colour spreading as more are purified.
- Out:
  - The mutation choice (item_026), ring difficulty (item_027), the region victory (item_028), migration (item_029).

# Acceptance criteria
- AC1: A won game purifies its hexagon and opens exactly its neighbours, checked by a simulation or planet test.
- AC2: A new game is refused on a locked hexagon and accepted on an open one, with a French reason on the planet screen.
- AC3: Purified, open and locked hexagons read apart on the planet at 375 and 1366 wide, in 2D and 3D, matching the approved mockup.
- AC4: Free mode threat and losses after hatching leave the planet state unchanged.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: deferred to implementation; this slice's AC1.
- request-AC2 -> This backlog slice. Proof: deferred to implementation; this slice's AC4 (free mode leaves the planet unchanged).

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
- Priority: High
- Rationale: First: every other endgame slice builds on the planet state.

# Notes
- Hybrid rationale: Derived from request `req_001_design_the_endgame_after_hatching` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_001_design_the_endgame_after_hatching.md`.
- Generated locally by logics-manager.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |


# Tasks
- `task_004_orchestrate_the_endgame_after_hatching`
