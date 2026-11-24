## item_022_redesign_the_core_panel_as_one_demand_at_a_time_with_its_recipe_drawn - Redesign the core panel as one demand at a time with its recipe drawn
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Interface
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: The core's sheet shows one demand at a time behind tabs and draws its recipe as a top-down schema with the game's glyphs.
- Keywords: core, sheet, panel, demand, tabs, recipe, schema, encapsulator, glyphs
- Use when: changing what the core's sheet shows or how a recipe is drawn.
- Skip when: changing the recipes themselves (item_021) or the stage header.

# Problem
- The core's sheet listed every demand, the story, the base genes and what the stage unlocks at once, with recipes as rows of small steps: the play tester could not tell which demand was blocked or why.

# Scope
- In:
  - Approved mockup: `docs/design/core-panel-v2.html` and `docs/design/core-panel-v2.png`.
  - Header: the stage, a 6-segment bar, an info button. Tabs: one per demand, drawn with the game's icons, a red dot on a blocked one, done ones dimmed.
  - The selected demand big with its count and gauge, then its recipe as a schema: bases with their input side, the machine, what it outputs, carbon from the side, the encapsulator's mode written on it, down to the core. Green outline: made in the base already; dashed: missing; red: a machine set wrong, with the existing encapsulator warning as the sentence.
  - The story, the stage frieze, the base genes and what the next stage unlocks move to the stage page behind the info button.
- Out:
  - Changing the recipes, the hunger rule or the header.

# Acceptance criteria
- AC1: One demand shows at a time; the tabs switch it; a blocked demand carries a red dot.
- AC2: The recipe is drawn with glyphs, with made, missing and wrongly set states, and never shows a gene in letters.
- AC3: The story, base genes and unlocks are behind the info button.
- AC4: The panel fits 1280x720 and a 390 wide phone.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: `tests/prototype/core-panel.test.mjs` (fits 1280x720 and a phone), `tests/prototype/sheet.test.mjs`.

# Implementation notes (2026-11-24)
- `coreSheet`, `recipeSVG` and `stageInfo` in `src/game/hud.js`; `packTrouble` in `src/game/actions.js` gives the encapsulator warning with the gene it is about; `sentenceHTML` in `src/game/input.js` draws a sentence's codes as pictograms for markup.
- Made already: a built harvester on that matter, or a machine whose last output is that item. The core's hit points are in the top bar, so the sheet hides the card's head; the schema shrinks with the screen height so the panel fits 1280x720 without scrolling.
- Hunger is told in the header and by a red dot on the info button; the stage page repeats it with the base genes.

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
- Rationale: Approved by the operator after the first play test; the sheet is where a player learns what to build.

# Notes
- Generated locally by logics-manager.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
