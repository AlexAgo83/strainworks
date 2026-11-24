## item_008_reproduce_and_fix_the_stage_4_assembler_and_encapsulator_case - Reproduce and fix the stage 4 assembler and encapsulator case
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 18:54:24

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: reproduce, fix, stage, assembler, encapsulator, case
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- Two setups the tester saw as identical gave different results: one assembled and encapsulated, the other kept its inputs; the tester could not tell why and stopped.

# Scope
- In:
  - Rebuild the stage 4 recipes the tester faced (two genes joined then encapsulated) in a test, try each side and order of entry, find what differs.
  - Fix a fault, or show in the machine's sheet why it waits (wrong half, wrong side, wrong box).
- Out:
  - New recipes.

# Acceptance criteria
- AC1: A test reproduces the case.
- AC2: The machine either works or says in its sheet what it waits for.

# Findings (2026-11-24)
- Root cause of the tester's stage 4 case, found on the tester's own save (kept outside the repository): neither encapsulator was jammed. Both were set to capsule. One goal asked capsules of its gene and was filled; the other asked magazines of FCS, and its encapsulator made capsules of FCS that the core ate without counting them. The sheet said "Il tourne." for both. Measured on the save: in 30 s the core ate 10 capsules of FCS for a magazine goal left at 0/40, and 11 capsules of FFS that took that goal from 26/30 to 30/30.
- Two other silent stops were reproduced earlier: an encapsulator set to magazine refusing two-gene strands, and a second, different gene waiting at the door until a box of the first is full. The sheet explained both once the machine was selected, but nothing showed on the map.
- Operator decision: a signal only, no rule change; the core still accepts any box it is sent.

# Implementation notes (2026-11-24)
- `packWarning` in `src/game/actions.js`: an encapsulator whose box matches no open goal for its gene while another box would says "Le cœur demande des chargeurs de FCS : passe en chargeur."; one with a second gene waiting says which gene is inside and which waits outside.
- Shown as a red ring on the map (like a dry turret), first in its sheet, and in the statistics' problem list. English lines added to `prototype/en.js`.
- `tests/prototype/pack-warning.test.mjs` rebuilds both cases from scratch.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A test reproduces the case.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_act_on_the_first_play_test`
- Architecture decision(s): (none yet)
- Request: `req_003_act_on_the_first_play_test`
- Primary task(s): `task_003_orchestrate_the_fixes_from_the_first_play_test`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
