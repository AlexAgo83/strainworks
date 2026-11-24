## prod_002_modularize_the_single_file_prototype - Modularize the single-file prototype
> Date: 2026-11-24
> Status: Proposed
> Related request: `req_002_modularize_the_single_file_prototype`
> Related backlog: `item_004_move_the_css_the_english_dictionary_and_the_sprite_sheet_out_of_the_page`, `item_005_replace_the_building_type_lists_with_one_trait_table`, `item_006_split_the_game_script_into_es_modules`, `item_007_lint_and_type_all_game_code_and_generate_the_babylon_cdn_pin`
> Related task: `task_002_orchestrate_the_modularization_of_the_prototype`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Development-ready workflow corpus for modularize the single-file prototype.

# Goals
- Make the generated corpus usable without transcript context.

# Non-goals
- Automatically implementing generated tasks.

# Scope and guardrails
- In: scaffolded request, product, backlog, orchestration task, validation, and handoff context.
- Out: unrelated workflow docs and implementation of generated tasks.

# Key product decisions
- Use structured input as the source of truth for generated docs.
- Keep generated write paths local and repo-bounded.

# Success signals
- Generated docs pass lint and audit without broad manual rewrites.
- Context-pack output can be handed to an implementation agent directly.

# References
- Product back-reference: `req_002_modularize_the_single_file_prototype`
- Task back-reference: `task_002_orchestrate_the_modularization_of_the_prototype`
