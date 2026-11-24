## item_017_carry_production_over_between_stages_with_base_genes_drawn_per_game - Carry production over between stages with base genes drawn per game
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 19:38:22

# AI Context
- Summary: Carry production over between stages with base genes drawn per game, as decided after the first play test (item_015).
- Keywords: carry, production, over, between, stages, base, genes, drawn, per, game
- Use when: working on progression and stage design after the first play test.
- Skip when: fixing interface details.

# Problem
- Each stage asked for a gene drawn at random, so nothing built served later and the best move was to tear everything down.

# Scope
- In:
  - A designed pool of base genes, matched to the deposits; a few drawn at the start of each game and fixed until it ends.
  - The core consumes the base genes continuously, alongside the stage goal.
  - A tool to dismantle a whole area at once.
- Out:
  - The recipes above the base genes (item_021).

# Acceptance criteria
- AC1: A chain built for a base gene at stage 2 still feeds the core at stage 5, in a simulation test.
- AC2: Every draw from the pool is feasible on its map, checked over many seeds in Node tests.
- AC3: The guide speaks of this game's base genes.

# Operator approval (2026-11-24)
- Approved as proposed: three base genes drawn per game among SFS, FFF, SSS, CCF, CSC, NFN, SSN and FNF, filtered by the deposits on the map with at least one base near the core; stages layered on them; the core eating them continuously.

# Implementation notes (2026-11-24)
- `drawBase`, `layeredGoals`, `eaten` and `hungryFor` in `src/sim/sim.ts`; a new game with drawn recipes stores `G.base` and `G.baseAt`. Older saves and the demo have no `G.base` and keep their recipes and rules.
- Continuous consumption: the core eats the first base gene from stage 1, one more each stage, all three from stage 3. A stage's deliveries count only while each base gene it eats came in the last 30 seconds (`BASE_WINDOW`); the core's card and the stage header say which gene it hungers for. The consequence of hunger (nothing counts) is a default chosen here, to confirm with the operator.
- Tests: `tests/sim/base-genes.test.ts` (draw over 200 seeds, layering, hunger), `tests/prototype/base-genes.test.mjs` (the card), `tests/prototype/recipes.test.mjs` retargeted to the layered stages.
- Left: the tool to dismantle a whole area, and the guide naming this game's base genes.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: A chain built for a base gene at stage 2 still feeds the core at stage 5, in a simulation test.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_act_on_the_first_play_test`
- Architecture decision(s): (none yet)
- Request: `req_003_act_on_the_first_play_test`
- Primary task(s): `task_003_orchestrate_the_fixes_from_the_first_play_test`

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- From the decisions recorded in `item_015_review_room_carry_over_between_stages_waits_and_the_reason_to_fight`.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
