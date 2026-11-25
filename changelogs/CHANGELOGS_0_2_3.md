# Strainworks 0.2.3

Release date: 2026-11-25.

Two traps found by a scripted playthrough of drawn games, and the playthrough itself.

- A gate wired to the core now lets through the capsules the core asks for. Before, it never passed a capsule:
  stage 3 asks for capsules and for items passed by a nerve, and a gate put on the capsule line stayed red for good.
- An encapsulator on heavy capsules takes carbon and isotope on both its sides, so each can come on its own line.
  Fed on one side, anything but exactly two carbons to one isotope made one capsule, then the matter in excess
  blocked the other for good.
- `npm run playthrough` plays fresh drawn games in the browser, through the game's own tools, up to the hatching,
  and reports each stage: what was asked, how long it took, the DNA, what the swarms broke and any error. It runs
  on demand, outside the default tests.
