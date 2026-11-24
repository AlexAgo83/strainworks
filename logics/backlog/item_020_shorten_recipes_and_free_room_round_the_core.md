## item_020_shorten_recipes_and_free_room_round_the_core - Shorten recipes and free room round the core
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 19:20:40

# AI Context
- Summary: Shorten recipes and free room round the core, as decided after the first play test (item_015).
- Keywords: shorten, recipes, free, room, round, core
- Use when: working on progression and stage design after the first play test.
- Skip when: fixing interface details.

# Problem
- One encapsulated strand needed six or more lines into the Ligases, then the assembler and the encapsulator, on a small map: the lines tangled and the ground round the core filled by stage 3.

# Scope
- In:
  - Recipes with fewer inputs, using the base genes as intermediates.
  - More free ground round the core.
- Out:
  - Copy and paste of a block (deferred).

# Acceptance criteria
- AC1: The longest stage recipe needs at most an agreed number of input lines.
- AC2: The ground round the core keeps an agreed free area at the start.

# Operator decision (2026-11-24)
- A recipe takes at most 3 input lines, this game's base genes counting as intermediates, and a 16 x 16 square round the core is free of deposits and obstacles.

# Implementation notes (2026-11-24)
- `inputLines` and `MOST_LINES` in `src/sim/sim.ts`: a base gene already made is one line, any other gene its three bases, a box adds carbon, a heavy box its isotope too.
- Recipes changed to fit: the heavy capsule of stages 5 and 6 holds one base gene (`H:c`, three lines) instead of a strand of two (four). The family born on entering stage 4 is the one the third base gene answers, so the antidote magazines asked there are magazines of a base gene (two lines). That family may be a palindrome, unlike the ones bred at random.
- `CLEARING` and `inClearing`: in new games no deposit cell is drawn in the 16 x 16 square round the core; nests already stood farther. Older saves keep their deposits.
- Proof: `tests/sim/room.test.ts` (every recipe of every stage over 200 seeds, the stage 4 antidote, the square over 20 seeds).

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: The longest stage recipe needs at most an agreed number of input lines.

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
