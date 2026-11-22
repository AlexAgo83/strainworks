## item_003_render_the_shared_simulation_in_3d - Render the shared simulation in 3D
> From version: 0.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Rendering
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: A Babylon.js view over the same state and saves as the 2D canvas, judged on phone readability and frame rate.
- Keywords: render, shared, simulation
- Use when: drawing the game in 3D
- Skip when: changing game rules or the 2D interface

# Problem
- The decided look is 3D, and its readability and cost on a phone are unknown.

# Scope
- In:
  - A Babylon.js view with a fixed tilted top-down camera drawing the same state as the 2D view.
- Out:
  - A second copy of the game rules.
  - Deployment and release.

# Acceptance criteria
- AC1: The 2D and 3D views show the same game and share saves.
- AC2: Readability captures and frame rate are recorded at phone and desktop sizes.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: The 2D and 3D views show the same game and share saves.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_strainworks`
- Architecture decision(s): (none yet)
- Request: `req_000_turn_the_validated_strainworks_prototype_into_a_game`
- Primary task(s): `task_001_orchestrate_the_path_from_prototype_to_game`

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |

