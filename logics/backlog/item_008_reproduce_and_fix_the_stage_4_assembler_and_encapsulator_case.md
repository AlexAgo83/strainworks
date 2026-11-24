## item_008_reproduce_and_fix_the_stage_4_assembler_and_encapsulator_case - Reproduce and fix the stage 4 assembler and encapsulator case
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

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

