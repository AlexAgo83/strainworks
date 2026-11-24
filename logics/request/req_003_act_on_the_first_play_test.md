## req_003_act_on_the_first_play_test - Act on the first play test
> From version: 0.1.38
> Schema version: 1.0
> Status: In progress
> Understanding: 95%
> Confidence: 90%
> Complexity: High
> Theme: Player experience
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-11-24 22:56:12

# AI Context
- Summary: Fixes and design decisions from the first outside play test of 0.1.38.
- Keywords: act, first, play, test
- Use when: changing anything the first play test raised: controls, lines, sound, small screens, pace, purpose.
- Skip when: work unrelated to that play test.

# Needs
- Fix what blocked or confused the first outside tester, who played 0.1.38 for 52 minutes on a 13-inch laptop, cleared stages 1 to 3 and stopped at stage 4.
- Keep the tester's raw material private: notes here are paraphrased, with no name, recording or screenshot from the session.

# Context
- Play test of 2026-11-24, one tester who plays Factorio a lot and compares with it; the raw transcript and four screenshots are kept outside the repository.
- Liked: the music, recipes that read clearly once the core's sheet is found, the Ligase's input swap once discovered, the right click to dismantle.
- Blocking: at stage 4 two identical assembler and encapsulator setups behaved differently, one consuming its inputs and the other not; the tester stopped there.
- Sound: music loud at launch with no master volume; the game and the music pause when the window loses focus, which the tester would like as an option.
- Small screen: the core's sheet with its recipes runs behind the bottom dock on a 13-inch screen and cannot be scrolled.
- Hidden information: what MK2, MK3 and the large harvester add is unclear; the options a machine offers when clicked (rank, swap, empty) were found late; Empty disappears from the sheet once used.
- Controls: no H and V flip keys (the swap exists only in the machine's sheet), the eyedropper (Q) went unnoticed, a click in rotate mode turns the piece unexpectedly.
- Lines: drawing and dismantling sometimes extend a line and sometimes start a perpendicular one; some turns are taken and others refused; a line passing beside a harvester links to it; a line drawn from a harvester did not start where expected; a bridge cannot be dismantled without breaking the line before it; the direction of a belt reads poorly.
- Reading the board: empty Ligase inputs drawn in red look like errors.
- Room and pace: the ground round the core fills fast; each stage's recipes call for new lines, so the tester tore everything down at each stage; waiting for counts such as 50 felt long; stage 4 felt like stage 3 again.
- Purpose: the splitter, the fights and the mutations seemed optional, since no fight was needed to progress.
- Statistics: one production stopped while another went on, with nothing saying why.
- Suggestion: let a harvester's output pass under a line like a bridge.
- Follow-up after the session: no fight was ever needed, DNA piled up so costs and ranks meant nothing, stages read as unrelated puzzles with random recipes, few mechanics were added, and lines tangled on a small map. Design decisions on each point are recorded in item_015; this work starts once req_002 is done.

# Acceptance criteria
- AC1: The stage 4 assembler and encapsulator case is reproduced from the tester's description, its cause fixed or explained in the game, and covered by a test.
- AC2: Sound has a master volume, a quieter first start, and an option to keep playing when the window is hidden.
- AC3: The core's sheet, the trays and the machine sheets stay readable and scrollable on a 1280 by 720 screen and on phones.
- AC4: Ranks, large harvesters and machine options say what they give where the player looks, and Empty stays available after use.
- AC5: H and V flip what can be flipped, the eyedropper and other keys are shown where they act, and rotate mode no longer turns a piece by surprise.
- AC6: Drawing and dismantling lines follow one rule the player can predict, documented in the help, with tests for each case the tester met.
- AC7: Empty inputs no longer read as errors, and a belt's direction reads at a glance.
- AC8: Room and progression are reviewed: space round the core, lines that carry over between stages, waits and stage variety, and a reason to fight, each with a decision recorded.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_003_act_on_the_first_play_test`
- Architecture decision(s): (none yet)

# References
- prototype/index.html
- prototype/style.css
- logics/request/req_002_modularize_the_single_file_prototype.md

# Backlog
- `item_008_reproduce_and_fix_the_stage_4_assembler_and_encapsulator_case`
- `item_009_give_sound_a_master_volume_and_a_choice_to_play_on_in_the_background`
- `item_010_fit_the_core_s_sheet_and_the_panels_on_small_screens`
- `item_011_say_what_ranks_large_harvesters_and_machine_options_give`
- `item_012_add_flip_keys_and_make_the_keys_and_rotate_mode_predictable`
- `item_013_make_drawing_and_dismantling_lines_follow_one_rule`
- `item_014_stop_empty_inputs_from_reading_as_errors`
- `item_015_review_room_carry_over_between_stages_waits_and_the_reason_to_fight`
- `item_016_give_the_player_a_reason_to_fight`
- `item_017_carry_production_over_between_stages_with_base_genes_drawn_per_game`
- `item_018_tighten_the_economy_so_dna_and_ranks_matter`
- `item_019_make_each_stage_require_a_mechanic_the_game_already_has`
- `item_020_shorten_recipes_and_free_room_round_the_core`
- `item_021_draw_recipes_from_the_base_genes_and_show_the_final_goal`
- `item_022_redesign_the_core_panel_as_one_demand_at_a_time_with_its_recipe_drawn`
- `item_023_show_an_unlock_card_the_first_time_a_new_building_is_picked`
- `item_024_let_idle_drones_orbit_the_core_as_if_charging`

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
