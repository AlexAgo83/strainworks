## item_026_draw_three_strain_mutations_at_each_hatching_and_let_the_player_choose_one - Draw three strain mutations at each hatching and let the player choose one
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
- Summary: At each hatching the player picks one of three permanent strain mutations from a designed pool; they apply to every later game on the planet.
- Keywords: draw, three, strain, mutations, each, hatching, let, player, choose
- Use when: changing the mutation pool, its draw, its choice screen or how a mutation applies to a new game.
- Skip when: creature mutations in a game (sim mutate), which are a different thing.

# Problem
Nothing carries from one won game to the next, so a new game is the same climb again.

# Scope
- In:
  - A designed pool of strain mutations, each a small lasting bonus applied at a new game's start: one more drone, more starting DNA, one base recipe shorter, a turret or a building already unlocked, a cheaper first rank, a faster harvester. Stacking ones have a cap.
  - At hatching, three distinct mutations are drawn (seeded by the game) and shown on a choice screen; the player picks one; the choice is stored on the planet.
  - The planet screen lists the mutations held; a new game's start applies them and says so once.
  - Naming: "mutation de souche" where a creature's mutation could be confused.
- Out:
  - New buildings or new mechanics as mutations.
  - Removing or trading a mutation.

# Acceptance criteria
- AC1: Every pool entry applies at a new game's start and is checked by a simulation test (drones, DNA, recipe length, unlocks).
- AC2: A draw offers three distinct mutations the planet can still take, never one at its cap.
- AC3: The choice screen matches the approved mockup at 375 and 1366 wide, in French and English, and cannot be skipped by accident.
- AC4: Balance: the reference game with the strongest mix of three mutations still needs stages 1 to 6 (no stage skipped).

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
