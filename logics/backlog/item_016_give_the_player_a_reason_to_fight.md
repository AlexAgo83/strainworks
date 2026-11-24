## item_016_give_the_player_a_reason_to_fight - Give the player a reason to fight
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 80%
> Progress: 90%
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

# Operator decision (2026-11-24)
- Nest threat grows with the size of the base, first attack possible from stage 3; a small base stays quiet, an expanding one must defend. Rich deposits and the rare F sit inside the nests' reach. A destroyed nest gives a reward.

# Implementation notes (2026-11-24)
- `RISE`, `baseSize` and `rise` in `src/sim/sim.ts`: from stage 3, a base of more than 20 machines (belts, splitters, sorters, bridges, walls and relays not counted) wakes the sleeping nest nearest the core, one more for every 10 machines past that, at least 180 s apart. Before stage 3, or under 21 machines, no nest wakes on its own; a nest the player disturbs still wakes as before.
- Rich deposits: in new games every rich deposit is within reach of a kept nest. The two ×2 deposits whose nests were thinned for standing within 30 cells of the core keep their nests (added after the others, so families do not move), and the free field south of the base, which has no nest, is plain (×1). The rare F: the ×4 Fibre deposit is guarded; the plain one near the core is left free so the first stages stay quiet. Say if "the rare F" meant that near one.
- Reward: a destroyed nest already paid its creatures in DNA and freed its ground, said in the event; now tested.
- Proof: `tests/sim/threat.test.ts`. AC1 (no stage 4 without holding off a nest) holds through item_019 (stage 4 asks 10 creatures killed by their antidote) and is measured in item_018's reference game.

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
