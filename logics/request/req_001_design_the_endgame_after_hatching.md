## req_001_design_the_endgame_after_hatching - Design the endgame after hatching
> From version: 0.1.28
> Schema version: 1.0
> Status: Draft
> Understanding: 60%
> Confidence: 50%
> Complexity: Medium
> Theme: General
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# AI Context
- Summary: Give players a reason to keep playing after stage 6 (Hatching); today the game is won and free mode only turns deliveries into DNA.
- Keywords: endgame, hatching, free mode, victory, stage 6, progression
- Use when: designing what happens after the victory screen, or long-term goals across games.
- Skip when: working on stages 1 to 5, buildings or balance before the victory.

# Needs
- After the 10 heavy capsules of stage 6 the game shows the victory screen and goes on in free mode, where every delivery becomes DNA. Nothing new opens at stage 6 except the third reach level at the Laboratory, and free mode has no goal. The operator wants an endgame to be designed, later.

# Context
- Ideas raised on 2026-11-24, not chosen yet:
  - Endless contracts in free mode: the core asks for harder and harder recipes, each tier pays a trophy or a bonus.
  - Planet conquest: clearing every nest of a hex marks it purified on the planet; full victory is a purified region.
  - New cycle: start a new game with a lasting bonus (one more drone, starting DNA) for each successful hatching.
- The threat keeps rising with production in free mode (`menace()`), so a goal there must stay winnable.

# Acceptance criteria
- AC1: One endgame direction is chosen by the operator, with its goals and rewards.
- AC2: Scope boundaries and operator impact are explicit.
- AC3: The request is ready to be promoted into a backlog slice.

# Definition of Ready (DoR)
- [ ] Problem statement is explicit and user impact is clear.
- [ ] Scope boundaries (in/out) are explicit.
- [ ] Acceptance criteria are testable.
- [ ] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `prototype/index.html` (`STAGES`, the victory screen and free mode)

# Backlog
- none

# Executions
| When | Runner | Run id | Title | State | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
