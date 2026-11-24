# Strainworks 0.2.0

Release date: 2026-11-24.

The first play test changed the game's shape: each game now stands on its own base genes, every stage asks for a
mechanic and a fight, swarms come to the base, and the core says plainly what it wants. Older games keep their
recipes and rules.

## Modularization and audit

- The game runs as ES modules: the simulation in `src/sim` (no DOM, tested in Node), the interface split by concern
  in `src/game`. The built site and the browser tests bundle the same modules.
- Every building declares its traits in one table instead of scattered type lists.
- Biome and TypeScript check all game code; the Babylon.js pin is written at build from the installed package.
- Typing found and fixed two listener checks that were always true.

## Play test fixes

- Sound: a master volume, a quieter first start, and a choice to keep playing while the window is hidden.
- Small screens: the machine card never runs under the dock or above the screen; the speed button moves beside
  the pause on a short screen. Speed goes x1, x3, x6, and the button names the next one.
- A rank button shows the rate before and after; the large harvester's help gives its rates.
- Keys: H mirrors the machine under the pointer, V turns it round; the card's buttons name their key.
- Filled inputs are green and empty ones grey, never red; belt arrows are larger.
- A large harvester feeds only the lines drawn from it; a bridge dismantled on its own gives its belt back.
- An encapsulator set on the wrong box, or blocked by a second gene, says so on the map, in its card and in the
  statistics.
- The statistics name why a production stopped: nothing comes in, the output is blocked, a wrong setting, no
  carbon, a full deposit, a closed gate.

## Base genes and layered recipes

- A new game draws three base genes from a designed pool, matched to the deposits on its map. Every stage's recipe
  is built on them and on earlier products, so a line built at stage 2 still feeds the core at stage 5.
- The core eats its base genes all along. While one it eats has not arrived for 30 seconds, stage deliveries
  count half.
- No recipe takes more than three input lines: the heavy capsule holds one base gene, and the stage 4 antidote is
  one of this game's base genes.
- Each stage from 2 to 5 also asks for a mechanic the game already has: sorting, nerves, turrets killing with the
  antidote, then an outpost held by a nest.
- A 16 x 16 square round the core is free of deposits and nests.
- The first guide teaches this game's first base gene, and the final goal is shown from the start.

## Economy

- A deposit feeds at most three harvesters: past them, share a line with a splitter or rank it up.
- The core's food and recipes pay no DNA; what it does not ask for pays half of before. A stage pays 100.
- Producers and stores rank up at one and a half times their former prices.
- A reference game in the simulation reaches stage 4 with about 580 DNA at a steady pace, under 1,000 at a slow one.

## Threat: swarms, nests and a first defence

- From stage 2, swarms come to the base every two minutes, each announced with the assault alarm, where it comes
  from, how many and its antidote, the brief counting it down. The first is three slow, frail creatures; then they
  grow with time and with the base.
- The first announcement starts a new guide, "Ta première défense": a turret, genes for it, a nerve, a wall.
- Nests stay the heavy guards of the rich deposits: every rich deposit lies in a nest's reach, and a destroyed nest
  pays its creatures in DNA and frees its ground.

## Core panel

- The core's card shows one demand at a time behind tabs drawn with the game's icons, a red dot on a blocked one.
- The chosen demand comes with its recipe drawn as a schema, from the bases to the core: green when made already,
  dashed when missing, red when a machine is set wrong, with the sentence saying what to do.
- The stage's mechanic has its own tab with its count and a button to its card. The story, the base genes and what
  the stage unlocks are behind an info button. The panel fits 1280 x 720 and a phone.

## Unlock cards and building

- The first time a building a stage opened is picked, a card shows it at work in a small looping scene, what it is
  for and its keys. Every building has one, in French and English, and the help lists them all.
- Démonter dragged from bare ground takes down a whole area.
- Idle drones orbit the core as if charging, in 2D and 3D.

## Tooling

- Tests start as a player who has seen every unlock card unless they ask otherwise.
- Local test runs can draw WebGL on a graphics card with `STRAINWORKS_GPU=1` (WSL2 with a GPU driver); CI keeps
  SwiftShader.
