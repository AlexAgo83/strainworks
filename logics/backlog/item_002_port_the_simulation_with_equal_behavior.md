## item_002_port_the_simulation_with_equal_behavior - Port the simulation with equal behavior
> From version: 0.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Simulation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: Extract the fixed 0.05 s step, with flow, threat, construction, transports and nerves, under src/sim, keeping every recorded result equal.
- Keywords: port, simulation, equal, behavior
- Use when: moving game logic out of the prototype page
- Skip when: proposing a rule change

# Problem
- Rules, drawing and input share one page, which prevents offline computation, fast tests and a second renderer.

# Scope
- In:
  - A deterministic fixed-step TypeScript simulation under src/sim, used by the prototype.
- Out:
  - Rule changes during the port.
  - An engine facade, ECS or state framework.

# Acceptance criteria
- AC1: The recorded prototype results are unchanged when the prototype uses src/sim.
- AC2: src/sim imports neither the DOM nor a renderer.

# Implementation notes (2026-11-24)
- The page's script became ES modules bundled by Vite (`scripts/bundle-game.mjs`): `src/game/main.js` for the interface, `src/sim/` for the simulation.
- `src/sim/sim.ts` holds every declaration reachable from `step`, `fresh` and `put` once the interface's calls are cut: 255 names. It imports only `hooks.ts` (messages, sounds, selection, settings, filled by the page) and `text.ts` (the language, set by `src/game/lang.js` before the tables are written).
- The interface replaces simulation bindings through `simSet` (a loaded game, a reset network, the timing probes); the window API keeps the browser tests' names working.
- `tests/sim/` runs the simulation in Node, without a page: a harvester line delivering, and a seeded game replayed identically.
- `sim.ts` starts with `@ts-nocheck` and is left out of Biome: typing and linting it is step 5 (item_007).

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The recorded prototype results are unchanged when the prototype uses src/sim.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_strainworks`
- Architecture decision(s): (none yet)
- Request: `req_000_turn_the_validated_strainworks_prototype_into_a_game`
- Primary task(s): `task_001_orchestrate_the_path_from_prototype_to_game`

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
