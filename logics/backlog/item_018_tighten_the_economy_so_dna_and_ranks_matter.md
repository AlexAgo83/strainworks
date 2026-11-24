## item_018_tighten_the_economy_so_dna_and_ranks_matter - Tighten the economy so DNA and ranks matter
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 19:50:03

# AI Context
- Summary: Tighten the economy so DNA and ranks matter, as decided after the first play test (item_015).
- Keywords: tighten, economy, dna, ranks, matter
- Use when: working on progression and stage design after the first play test.
- Skip when: fixing interface details.

# Problem
- DNA piled up (about 4,000), so costs meant nothing, MK2 and MK3 felt pointless, and splitters were useless since a new line from the harvester was free.

# Scope
- In:
  - Fewer DNA gains and dearer ranks.
  - A limit on harvesters per deposit, so lines are shared and splitters matter.
  - Each rank's sheet shows the rate before and after (done for producers in the quick fixes).
- Out:
  - A new currency or resource.

# Acceptance criteria
- AC1: In a simulated reference game, DNA held at stage 4 stays under an agreed ceiling.
- AC2: A deposit refuses a harvester past its limit, with the reason said.
- AC3: Splitting one harvester's output is the cheapest way to feed two machines.

# Related decision (2026-11-24)
- A hungry core counts stage deliveries half (`HUNGRY_SHARE` in `src/sim/sim.ts`), recorded in item_017: feeding the base genes keeps full pace, so a lapse slows a stage without stopping it.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: In a simulated reference game, DNA held at stage 4 stays under an agreed ceiling.

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
