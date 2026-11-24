## item_009_give_sound_a_master_volume_and_a_choice_to_play_on_in_the_background - Give sound a master volume and a choice to play on in the background
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Audio
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 19:28:06

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: sound, master, volume, choice, play, background
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- Music is loud at first launch and only music and effects have volumes; the game and the music stop when the window is hidden.

# Scope
- In:
  - A master volume over music and effects, kept between visits.
  - A lower default music level at first launch.
  - A setting to keep the game and the music running when the window is hidden.
- Out:
  - New music.

# Acceptance criteria
- AC1: The audio settings have a master volume that scales music and effects.
- AC2: The background setting keeps the simulation and the music running while hidden.

# Implementation notes (2026-11-24)
- Master volume in the sound menu, music first at 0.3 and effects at half of it, and a 'Fenêtre cachée' switch that keeps the game and the music going while the window is hidden (a timer steps the game, since a hidden page draws no frames). Tested in `tests/prototype/playtest-fixes.test.mjs`.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The audio settings have a master volume that scales music and effects.

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
