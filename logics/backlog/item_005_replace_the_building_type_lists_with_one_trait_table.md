## item_005_replace_the_building_type_lists_with_one_trait_table - Replace the building type lists with one trait table
> From version: 0.1.38
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Summary: (unfilled: replace before this doc is used)
- Keywords: replace, building, type, lists, trait, table
- Use when: (unfilled: replace before this doc is used)
- Skip when: (unfilled: replace before this doc is used)

# Problem
- 41 hand-written type lists carry building traits; a new building silently misses some of them.

# Scope
- In:
  - Traits on each TYPES entry (or one table beside it) and helpers reading them.
  - Every literal type list that stands for a trait replaced by a trait query.
- Out:
  - Lists that are data, such as the order of a tray or a tutorial step.

# Acceptance criteria
- AC1: No literal list of building types stands for a trait outside the trait table.
- AC2: A test checks that every building type declares its traits.
- AC3: All existing tests pass unchanged.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: No literal list of building types stands for a trait outside the trait table.
- request-AC5 -> This backlog slice. Proof: AC2: A test checks that every building type declares its traits.

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

