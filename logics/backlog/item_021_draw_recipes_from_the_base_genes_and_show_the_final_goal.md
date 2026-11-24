## item_021_draw_recipes_from_the_base_genes_and_show_the_final_goal - Draw recipes from the base genes and show the final goal
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 19:20:40

# AI Context
- Summary: Draw recipes from the base genes and show the final goal, as decided after the first play test (item_015).
- Keywords: draw, recipes, base, genes, show, final, goal
- Use when: working on progression and stage design after the first play test.
- Skip when: fixing interface details.

# Problem
- The recipes felt like a roulette with no purpose: a problem posed for its own sake.

# Scope
- In:
  - Per-game recipes drawn only from this game's base genes and earlier stages' products, so each recipe builds on what the player already makes.
  - The final goal, what the antidote cures, shown from the start and on the core's card.
- Out:
  - The base gene pool itself (item_017).

# Acceptance criteria
- AC1: Every drawn recipe is made of base genes and earlier products, checked over many seeds.
- AC2: The final goal text shows on the first game and on the core's card, in French and English.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: Every drawn recipe is made of base genes and earlier products, checked over many seeds.

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
