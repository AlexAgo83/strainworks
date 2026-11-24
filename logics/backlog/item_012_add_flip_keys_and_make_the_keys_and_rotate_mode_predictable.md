## item_012_add_flip_keys_and_make_the_keys_and_rotate_mode_predictable - Add flip keys and make the keys and rotate mode predictable
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Controls
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: add, flip, keys, rotate, mode, predictable
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- The swap of a Ligase, an encapsulator or a joiner exists only in its sheet; the eyedropper went unnoticed; a click in rotate mode turns a piece by surprise.

# Scope
- In:
  - H and V flip the piece in hand or under the pointer where it has sides to swap.
  - Keys shown in the tooltips of the dock and the sheets.
  - Rotate mode: a click selects, the rotate key turns.
- Out:
  - Mirroring of shapes that have no side to swap.

# Acceptance criteria
- AC1: H and V swap the sides of every machine that has a swap button.
- AC2: The eyedropper key is shown in the dock's tooltips.
- AC3: A test covers a click in rotate mode.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: H and V swap the sides of every machine that has a swap button.

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

