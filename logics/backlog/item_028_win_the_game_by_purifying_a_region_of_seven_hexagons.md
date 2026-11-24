## item_028_win_the_game_by_purifying_a_region_of_seven_hexagons - Win the game by purifying a region of seven hexagons
> From version: 0.2.0
> Schema version: 1.0
> Status: Ready
> Understanding: 85%
> Confidence: 75%
> Progress: 0%
> Complexity: High
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 23:38:24

# AI Context
- Summary: Purifying a region, one hexagon and its six neighbours, is the grand victory, shown once with the planet changed.
- Keywords: win, game, purifying, region, seven, hexagons
- Use when: changing what counts as a region, the grand victory screen or what follows it.
- Skip when: a single game's victory at stage 6.

# Problem
Without a final goal the conquest has no end the player can aim for.

# Scope
- In:
  - A region: any hexagon with all its neighbours purified (six, or five round a pentagon).
  - When the last hexagon of a region is purified, the grand victory shows once: the region lit on the planet, the strains that made it, the mutations held.
  - The planet screen shows the closest region's progress (for example 4 / 7) and which hexagons it still needs.
  - After it, play goes on: more regions can be purified, free mode stays a sandbox.
- Out:
  - Online scores or sharing.

# Acceptance criteria
- AC1: The seventh hexagon of a region triggers the grand victory once; a pentagon's region needs six; checked by a planet test.
- AC2: The region progress on the planet names the hexagons still needed, matching the approved mockup.
- AC3: Free mode threat cannot cause or undo the grand victory.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: deferred to implementation; this slice's AC1.

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

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |


# Tasks
- `task_004_orchestrate_the_endgame_after_hatching`
