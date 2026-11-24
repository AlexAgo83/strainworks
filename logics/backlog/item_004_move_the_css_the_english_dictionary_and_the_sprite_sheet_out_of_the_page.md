## item_004_move_the_css_the_english_dictionary_and_the_sprite_sheet_out_of_the_page - Move the CSS, the English dictionary and the sprite sheet out of the page
> From version: 0.1.38
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: move, css, english, dictionary, sprite, sheet, out, page
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- Inert content makes up about a fifth of index.html and hides the code around it.

# Scope
- In:
  - The main stylesheet, the base64 model sprite sheet and the EN dictionary as separate files loaded by the page and the built site.
  - The site build and its offline cache list them.
- Out:
  - Any change to the styles, the texts or the models.

# Acceptance criteria
- AC1: index.html no longer contains the stylesheet, the sprite sheet data or the EN dictionary.
- AC2: The built site plays offline with the new files cached, checked by tests/site.test.mjs.
- AC3: All 92 tests pass unchanged.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: index.html no longer contains the stylesheet, the sprite sheet data or the EN dictionary.
- request-AC5 -> This backlog slice. Proof: AC2: The built site plays offline with the new files cached, checked by tests/site.test.mjs.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_002_modularize_the_single_file_prototype`
- Architecture decision(s): (none yet)
- Request: `req_002_modularize_the_single_file_prototype`
- Primary task(s): `task_002_orchestrate_the_modularization_of_the_prototype`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
