## item_023_show_an_unlock_card_the_first_time_a_new_building_is_picked - Show an unlock card the first time a new building is picked
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Interface
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: The first pick of a building a stage opened shows a card: the building at work drawn by the game's renderer, what it is for, its keys.
- Keywords: unlock, card, building, scene, tray, help, controls
- Use when: changing how a new building is introduced, or its card's text.
- Skip when: changing the guided start or the core's sheet.

# Problem
- New buildings opened by a stage arrived with one line of help: the play tester did not know what they were for or how they took and gave items.

# Scope
- In:
  - Approved mockup: `docs/design/unlock-card.html` and `docs/design/unlock-card.png`.
  - The first time a building opened by a stage is picked in the tray, a card opens: left, a looping scene drawn with the game's own 2D renderer (the building facing east, what enters on which side, what leaves); right, its name, what it is for, its controls with their keys, "Compris", and a note that the help shows it again.
  - Once per building, remembered in the settings storage (`strainworks-cards`); every building replayable from the help, under Bâtiments.
  - Every building has its scene and its text in French and English. Genes are drawn, never written in letters.
- Out:
  - Buildings open from the start do not open the card by themselves (the guided start covers them); the help still has their card.

# Acceptance criteria
- AC1: The first pick of a building opened by a stage opens its card, once.
- AC2: The card shows a scene, the name, what it is for and the controls with the keys the player chose.
- AC3: Every building has a card in French and English, and the help opens any of them.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: `tests/prototype/unlock-card.test.mjs`.

# Implementation notes (2026-11-24)
- `src/game/unlock.js`: one entry a building (what it is for, what enters on which side, what leaves); the scene draws the building facing east with `drawCell`, its belts and the moving items with `token`, five cells a side; under reduced motion it is one still frame. The controls are read from the building's traits and the player's keys.
- Shown from the tray's pick (`toolPod` in `src/game/view.js`) for a building with a stage in `NEEDS`, once, remembered under `strainworks-cards`; the help (`#commands`) lists every building under Bâtiments.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_003_act_on_the_first_play_test`
- Primary task(s): `task_003_orchestrate_the_fixes_from_the_first_play_test`

# Priority
- Priority: Medium
- Rationale: Approved by the operator after the first play test; new buildings were not understood.

# Notes
- Generated locally by logics-manager.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
