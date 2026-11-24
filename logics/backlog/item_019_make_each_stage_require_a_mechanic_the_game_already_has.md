## item_019_make_each_stage_require_a_mechanic_the_game_already_has - Make each stage require a mechanic the game already has
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
- Summary: Make each stage require a mechanic the game already has, as decided after the first play test (item_015).
- Keywords: each, stage, require, mechanic, game, already
- Use when: working on progression and stage design after the first play test.
- Skip when: fixing interface details.

# Problem
- Between stages 1 and 4 nothing new was needed: Ligases, belts and bridges did 80 percent of the work.

# Scope
- In:
  - One existing mechanic per stage made necessary: sorting, nerves, burner, turrets, drones, outposts.
  - The stage card names the mechanic and where to learn it.
- Out:
  - New machines or systems.

# Acceptance criteria
- AC1: Each stage's goal cannot be met without its mechanic, checked in a simulation test per stage.
- AC2: The stage card names it.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: Each stage's goal cannot be met without its mechanic, checked in a simulation test per stage.

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
