## item_015_review_room_carry_over_between_stages_waits_and_the_reason_to_fight - Review room, carry-over between stages, waits and the reason to fight
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 95%
> Confidence: 90%
> Progress: 50%
> Complexity: High
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 17:31:30

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: review, room, carry, over, between, stages, waits, reason, fight
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- The ground round the core fills fast, each stage made the tester tear down the last one, waits felt long, stage 4 felt like stage 3, and fights seemed optional; one production stopped in the statistics with no reason given.

# Scope
- In:
  - A design note with a decision on each point: room round the core, recipes that reuse earlier lines, counts and waits, variety between stages 3 and 4, what makes fights needed.
  - The statistics say why a production stopped.
  - The harvester-as-bridge suggestion answered.
- Out:
  - Implementing every idea in this item: each decision taken becomes its own item.

# Acceptance criteria
- AC1: A design note records a decision for each point.
- AC2: The statistics name the cause of a stopped production.

# Decisions (2026-11-24, with the operator)
- Follow-up from the tester, after the session: never had to defend, DNA piled up (about 4,000) so costs and ranks meant nothing, splitters were useless (a new line from the harvester is free), stages read as unrelated puzzles with recipes drawn at random, few mechanics were added between stages 1 and 4, and one encapsulated product needed six or more lines on a small map. The tester still found it fun.
- Reason to fight: both levers. Rich deposits and the rare F sit inside the nests' reach, and the threat grows with the base so that nests wake and attack on their own. A destroyed nest gives a reward (DNA, freed ground or a gene).
- Carry-over between stages: a few fixed base genes are the ingredients of later stages and the core consumes them continuously, so a chain built at stage 2 still serves at stage 5. A tool dismantles a whole area.
- Economy: tightened on every side. Fewer DNA gains, dearer ranks whose sheet shows the rate before and after, and a limit on harvesters per deposit so that splitters matter.
- Mechanics: each stage requires one mechanic the game already has (sorting, nerves, burner, turrets, drones, outposts); no new mechanic for now.
- Lines and room: recipes with fewer inputs (base genes act as intermediates) and more free ground round the core. Copy and paste of a block is deferred.
- Purpose: two layers. The base genes are fixed and the same in every game; the recipes above them are still drawn per game, but only from base genes and earlier stages' products, so each game differs while every recipe builds on what the player already makes. The final goal (what the antidote cures) is shown.
- Pace: a time acceleration button (x2, x4); counts stay as they are, since continuous consumption takes weight off fixed counts.
- Line drawing (item_013): the simple cases are fixed first (no link to a harvester a line passes beside, a bridge dismantles without breaking the line before it); the drawing rule itself waits for the tester's live walkthrough.
- Order: the modularization (req_002, steps 2 to 5) finishes first; this play test work, design included, follows on the split and tested simulation. Each decision above becomes its own backlog item when that work starts.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: A design note records a decision for each point.

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
- Rationale: Set by scaffold input or defaulted for grooming.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
