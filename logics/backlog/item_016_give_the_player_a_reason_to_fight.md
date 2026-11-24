## item_016_give_the_player_a_reason_to_fight - Give the player a reason to fight
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
- Summary: Give the player a reason to fight, as decided after the first play test (item_015).
- Keywords: player, reason, fight
- Use when: working on progression and stage design after the first play test.
- Skip when: fixing interface details.

# Problem
- The first tester never had to defend: resources lie by the core, nests sleep far away, and fights, turrets and mutations seemed optional.

# Scope
- In:
  - Rich deposits and the rare F placed inside the nests' reach.
  - A threat that grows with the base, so nests wake and attack on their own.
  - A reward for a destroyed nest: DNA, freed ground or a gene.
- Out:
  - Changing turrets, creatures or damage numbers beyond what the threat curve needs.

# Acceptance criteria
- AC1: A normal game cannot reach stage 4 without clearing or holding off at least one nest.
- AC2: Nests wake on their own as the base grows, measured in a simulation test.
- AC3: A destroyed nest gives a reward the player sees.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: A normal game cannot reach stage 4 without clearing or holding off at least one nest.

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
