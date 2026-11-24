## item_024_let_idle_drones_orbit_the_core_as_if_charging - Let idle drones orbit the core as if charging
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Low
> Theme: Interface
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: Idle drones orbit the core slowly, each on its own path, glowing as if charging; drawing only.
- Keywords: drones, idle, orbit, core, charge, render
- Use when: changing how drones are drawn at rest.
- Skip when: changing drone jobs or timings in the simulation.

# Problem
- Idle drones sat inside the core and were not raised, so they disappeared into it.

# Scope
- In:
  - Operator request (2026-11-24): an idle drone eases onto a slow orbit just outside the core's footprint, at its own phase, radius and height, with a soft charging glow, and eases back onto its real path when it gets a job; in 2D and in 3D, raised above the core in 3D.
  - Drawing only: the simulation's drones, their jobs and timings do not change.
- Out:
  - Any change to drone logic.

# Acceptance criteria
- AC1: Idle drones are drawn outside the core's footprint, apart from each other, in 2D and 3D.
- AC2: A drone given a job eases back onto its real path; the simulation's drone state is unchanged.

# Implementation notes (2026-11-24)
- `dronePose` in `src/game/actions.js` blends each drone's real pose with an orbit round the core by a per-drone rest value kept outside the game state (screen seconds, so it also settles while paused; still orbit under reduced motion). `drawDrones` in `src/game/render.js` draws a breathing glow, `prototype/models3d.js` swells the charge bead.
- Proof: `tests/prototype/drone-orbit.test.mjs`.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: `tests/prototype/drone-orbit.test.mjs`.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_003_act_on_the_first_play_test`
- Primary task(s): `task_003_orchestrate_the_fixes_from_the_first_play_test`

# Priority
- Priority: Medium
- Rationale: Operator request; small and visual.

# Notes
- Generated locally by logics-manager.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
