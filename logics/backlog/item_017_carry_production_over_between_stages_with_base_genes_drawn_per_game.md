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
> Indicators reviewed: 2026-11-24 19:20:39

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
