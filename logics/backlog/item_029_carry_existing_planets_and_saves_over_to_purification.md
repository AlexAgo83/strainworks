## item_029_carry_existing_planets_and_saves_over_to_purification - Carry existing planets and saves over to purification
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
- Summary: Existing planets and saves move to the purification model without losing a game.
- Keywords: carry, existing, planets, saves, over, purification
- Use when: changing the planet save format or reading old planets.
- Skip when: a new planet's rules.

# Problem
Players already hold won games and games in progress on hexagons that the new rules would lock.

# Scope
- In:
  - A versioned planet state; an old planet is read once: every won game's hexagon becomes purified (with its neighbours opened) and grants no retroactive mutation choice unless the operator decides otherwise.
  - Games in progress on hexagons that would now be locked stay playable where they are.
  - Export and import carry the planet state; an imported game keeps its hexagon rules.
- Out:
  - Rewriting old games' contents.

# Acceptance criteria
- AC1: An old planet with won and running games opens with those won hexagons purified, their neighbours open, and every game still playable, checked by a saves test.
- AC2: Export then import of a planet keeps purified hexagons, open hexagons and mutations held.
- AC3: Reading the same old planet twice changes nothing the second time.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: deferred to implementation; this slice's AC1.

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
