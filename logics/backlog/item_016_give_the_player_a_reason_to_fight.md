## item_016_give_the_player_a_reason_to_fight - Give the player a reason to fight
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 85%
> Progress: 100%
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

# Operator decision, later the same day (2026-11-24), superseding the size-only rule
- Constant swarms from stage 2: after the first guide, a first small, slow swarm is announced with the assault alarm and a countdown and comes to the base; from then on swarms arrive at regular announced intervals and grow with both time and base size. The first waves are weak: never a wipe from the first one. A swarm shows where it comes from, when it arrives and which gene kills it.
- A new guide, "Ta première défense", just before the first swarm: a turret, genes for it, a nerve, a wall.
- Nests stay separate: the heavy threats guarding the rich deposits, with a reward on destruction.

# Implementation notes (2026-11-24)
- `SWARM`, `swarmSize`, `planSwarm` and `swarms` in `src/sim/sim.ts` (drawn games only, `G.swarm` in the save): on entering stage 2 the first swarm is announced 180 s ahead (assault alarm, an event with its bearing, size and antidote, the top-right brief counting down), then one every 120 s. Size: 3, one more every 4 minutes since the first, one more every 8 machines past 10 (belts, splitters, sorters, bridges, walls and relays not counted), 40 at most. The first wave walks at half pace and bites at half strength (`drift`); hit points start at 6 and rise by 2 a wave.
- The guide "Ta première défense" (`DEFENSE_GUIDE` in `src/game/main.js`) starts with the first announcement and is checked on the game: one more turret, a turret holding genes, a nerve on a turret, one more wall; 5 DNA a step, like the first guide.
- The size-only rule tried first (nests waking on their own from stage 3) is withdrawn: nests wake only when disturbed, as before.
- Rich deposits: every rich deposit is within reach of a kept nest. The two ×2 deposits whose nests were thinned for standing within 30 cells of the core keep their nests (added last, so families do not move), and the free field south of the base is plain (×1). The ×4 Fibre deposit is guarded; the plain one near the core is free, so the first stages stay quiet.
- A destroyed nest pays its creatures in DNA and frees its ground, said in the event.
- Proof: `tests/sim/threat.test.ts` (no swarm before stage 2, the first one on time and weak, no wipe, growth with time and size, guarded deposits, the nest's reward), `tests/prototype/defense-guide.test.mjs` (the guide flow in the browser), `tests/sim/reference-game.test.ts` (swarms fought before stage 4 in every run).

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
