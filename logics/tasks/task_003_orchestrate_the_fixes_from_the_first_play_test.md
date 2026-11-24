## task_003_orchestrate_the_fixes_from_the_first_play_test - Orchestrate the fixes from the first play test
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: orchestrate, fixes, first, play, test
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Start after the modularization request req_002 is delivered, unless the operator moves a fix ahead.
- [ ] 2. First the blocking case (assembler and encapsulator), then sound and small screens, then controls and lines, then readability, then the design review.
- [ ] 3. Each fix: reproduce, fix, test, commit; push once CI is green; release when the operator asks, then ask the tester to replay.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_008_reproduce_and_fix_the_stage_4_assembler_and_encapsulator_case`
- `item_009_give_sound_a_master_volume_and_a_choice_to_play_on_in_the_background`
- `item_010_fit_the_core_s_sheet_and_the_panels_on_small_screens`
- `item_011_say_what_ranks_large_harvesters_and_machine_options_give`
- `item_012_add_flip_keys_and_make_the_keys_and_rotate_mode_predictable`
- `item_013_make_drawing_and_dismantling_lines_follow_one_rule`
- `item_014_stop_empty_inputs_from_reading_as_errors`
- `item_015_review_room_carry_over_between_stages_waits_and_the_reason_to_fight`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_008_reproduce_and_fix_the_stage_4_assembler_and_encapsulator_case`. Proof deferred to slice closeout.
- request-AC2 -> `item_009_give_sound_a_master_volume_and_a_choice_to_play_on_in_the_background`. Proof deferred to slice closeout.
- request-AC3 -> `item_010_fit_the_core_s_sheet_and_the_panels_on_small_screens`. Proof deferred to slice closeout.
- request-AC4 -> `item_011_say_what_ranks_large_harvesters_and_machine_options_give`. Proof deferred to slice closeout.
- request-AC5 -> `item_012_add_flip_keys_and_make_the_keys_and_rotate_mode_predictable`. Proof deferred to slice closeout.
- request-AC6 -> `item_013_make_drawing_and_dismantling_lines_follow_one_rule`. Proof deferred to slice closeout.
- request-AC7 -> `item_013_make_drawing_and_dismantling_lines_follow_one_rule`. Proof deferred to slice closeout.
- request-AC7 -> `item_014_stop_empty_inputs_from_reading_as_errors`. Proof deferred to slice closeout.
- request-AC8 -> `item_015_review_room_carry_over_between_stages_waits_and_the_reason_to_fight`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# Links
- Request: `req_003_act_on_the_first_play_test`
- Product brief(s): `prod_003_act_on_the_first_play_test`
- Architecture decision(s): (none yet)

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |

