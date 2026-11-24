## item_014_stop_empty_inputs_from_reading_as_errors - Stop empty inputs from reading as errors
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Interface
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 19:28:08

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: empty, inputs, reading, errors
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- Empty Ligase inputs are drawn with red rings, which reads as a fault.

# Scope
- In:
  - A neutral mark for an empty input; red kept for a real fault.
- Out:
  - Other colour changes.

# Acceptance criteria
- AC1: An empty Ligase input is drawn without red in 2D and 3D.

# Implementation notes (2026-11-24)
- Filled inputs are drawn green and empty ones grey, never red; belt arrows are larger and brighter.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: An empty Ligase input is drawn without red in 2D and 3D.

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
