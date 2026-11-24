## item_006_split_the_game_script_into_es_modules - Split the game script into ES modules
> From version: 0.1.38
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 60%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: split, game, script, modules
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- One global script of about 7,000 lines shares mutable state across 387 functions; nothing can be read, tested or reused alone.

# Scope
- In:
  - Modules under src for the 2D render, the interface, the planet screen, music and effects, saves and import/export, built by Vite.
  - A small window API exposing what the browser tests call, so they keep working during and after the move.
- Out:
  - A UI framework, an ECS or a state library.
  - The simulation itself, moved by item_002.

# Acceptance criteria
- AC1: index.html loads the game from src modules through Vite in dev and in the built site.
- AC2: The browser tests reach the game only through the window API.
- AC3: All existing tests pass and the demo base looks and plays the same.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: index.html loads the game from src modules through Vite in dev and in the built site.
- request-AC5 -> This backlog slice. Proof: AC2: The browser tests reach the game only through the window API.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_002_modularize_the_single_file_prototype`
- Architecture decision(s): (none yet)
- Request: `req_002_modularize_the_single_file_prototype`
- Primary task(s): `task_002_orchestrate_the_modularization_of_the_prototype`

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |

