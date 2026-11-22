# Strainworks

A browser and mobile incremental factory game crossed with tower defense: harvest four organic bases, write genes and strands of DNA, feed a growing organism, and fight creatures with the exact opposite of their gene.

The game is at prototype stage. See the [concept](docs/concept.md).

## Run the prototype

```sh
npm install
npm run dev
```

The browser opens `/prototype/`. The transport mockup is at `/prototype/transports/`. `prototype/index.html` is self-contained and also opens directly as a file.

## Check

```sh
npx playwright install chromium   # once
npm run check
```

`npm test` replays the prototype in headless Chromium: belt motion, sorters, bridges, gates, deposits and veins, breaches and damage, economy, construction and repair, worms, progression and nerves. Each run is seeded and compared with the recorded results in `tests/prototype/__snapshots__/`, and saves from earlier prototype versions must still load.

When a rule changes on purpose, rerun with `npm test -- -u` and read the snapshot diff before committing it: that diff is the gameplay change.

## Layout

| Path | Content |
|---|---|
| `prototype/` | The playable prototype and the transport mockup, French interface |
| `docs/concept.md` | Game concept and decisions |
| `tests/prototype/` | Behavior tests of the prototype |
| `tests/fixtures/saves/` | Saved games from earlier prototype versions |
| `src/` | The product. Empty until the simulation is ported |
| `logics/` | Workflow corpus |
