## item_001_keep_the_playable_prototype_and_play_test_its_core_loop - Keep the playable prototype and play test its core loop
> From version: 0.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Game design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: The prototype is the reference for behavior and fun: play findings go to docs/concept.md, rule changes update the recorded snapshots.
- Keywords: playable, prototype, play, test, core, loop
- Use when: changing a prototype rule or recording a play session
- Skip when: working only on rendering of the shared simulation

# Problem
- The rules are simulated and tested, but it is not yet known whether they are fun.

# Scope
- In:
  - Iterate on the prototype, review every snapshot change, and record play findings in the concept.
- Out:
  - Porting and 3D rendering.

# Acceptance criteria
- AC1: The prototype runs from a fresh clone and its behavior tests pass.
- AC2: A play session through stage 2 without waking a breach and one through a family change are recorded.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The prototype runs from a fresh clone and its behavior tests pass.
- request-AC3 -> This backlog slice. Proof: AC2: A play session through stage 2 without waking a breach and one through a family change are recorded.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_strainworks`
- Architecture decision(s): (none yet)
- Request: `req_000_turn_the_validated_strainworks_prototype_into_a_game`
- Primary task(s): `task_001_orchestrate_the_path_from_prototype_to_game`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |

