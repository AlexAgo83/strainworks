## item_013_make_drawing_and_dismantling_lines_follow_one_rule - Make drawing and dismantling lines follow one rule
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Controls
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 17:43:51

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: drawing, dismantling, lines, follow, rule
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- A drag sometimes extends a line and sometimes starts a perpendicular one; turns are sometimes refused; lines link to a harvester they pass; a bridge cannot be removed alone; a belt's direction reads poorly.

# Scope
- In:
  - One written rule for extend, turn and branch, shown in the help.
  - A line links to a harvester only when it starts or ends on it.
  - Dismantling a bridge leaves the belt under it.
  - A clearer arrow on belts.
- Out:
  - New logistics pieces.

# Acceptance criteria
- AC1: Tests cover extend, turn, branch, passing beside a harvester and dismantling a bridge.
- AC2: The help describes the rule.

# Findings (2026-11-24)
- A large harvester empties onto every belt along its eight edges, so a line drawn past it takes its output without being drawn from it (reproduced: 37 items in 10 s into a passing line).
- The drawing rule (an L whose corner moves until a turn is held for two cells, a one-cell step near the start turning at once) is deterministic but invisible; the tester's live walkthrough decides what to change.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Tests cover extend, turn, branch, passing beside a harvester and dismantling a bridge.
- request-AC7 -> This backlog slice. Proof: AC2: The help describes the rule.

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
