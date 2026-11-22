## req_000_turn_the_validated_strainworks_prototype_into_a_game - Turn the validated Strainworks prototype into a game
> From version: 0.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Game foundation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# AI Context
- Summary: Carry the rules proven in prototype/index.html into a shared simulation, then a 3D view, without losing the ability to iterate by playing.
- Keywords: turn, validated, strainworks, prototype, game
- Use when: deciding what to build next or where a rule belongs
- Skip when: tuning one prototype value already covered by the concept

# Needs
- Keep the prototype playable and easy to iterate on while the game is built.
- Move its rules into a deterministic simulation that does not depend on drawing or the browser, without changing behavior.
- Learn by playing whether feeding the core is satisfying without enemies and whether rewiring for a new antidote is a pleasure or a chore.
- See the game in 3D with a fixed top-down camera once the rules are shared.

# Context
- The concept and the decisions are in docs/concept.md. Rows marked Proposed there are not decided.
- The prototype is a single self-contained page with a fixed simulation step of 0.05 seconds.
- Behavior tests replay the prototype with seeded randomness and compare recorded results.
- No deployment, release or public visibility is authorized.

# Acceptance criteria
- AC1: The prototype opens from a fresh clone and its behavior tests pass.
- AC2: A simulation under src/sim reproduces the recorded prototype results without DOM or renderer imports.
- AC3: The findings of play sessions on the core loop are recorded in docs/concept.md.
- AC4: A 3D view draws the shared simulation and stays readable and measured on a phone.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_strainworks`
- Architecture decision(s): (none yet)

# References
- docs/concept.md
- prototype/index.html
- tests/prototype/harness.mjs

# Backlog
- `item_001_keep_the_playable_prototype_and_play_test_its_core_loop`
- `item_002_port_the_simulation_with_equal_behavior`
- `item_003_render_the_shared_simulation_in_3d`

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |

