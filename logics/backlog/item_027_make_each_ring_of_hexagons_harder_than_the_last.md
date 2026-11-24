## item_027_make_each_ring_of_hexagons_harder_than_the_last - Make each ring of hexagons harder than the last
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
