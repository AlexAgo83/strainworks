# Strainworks

A browser and mobile incremental factory game crossed with tower defense: harvest four organic bases, write genes and strands of DNA, feed a growing organism, and fight creatures with the exact opposite of their gene.

The game is at prototype stage. Version `0.1.0`. See the [concept](docs/concept.md) and the [changelogs](changelogs/README.md).

## Run the prototype

```sh
npm install
npm run dev
```

The browser opens `/prototype/`. The transport mockup is at `/prototype/transports/`. `prototype/index.html` also opens directly as a file, with `view3d.js`, `models3d.js` and `terrain3d.js` beside it.

The **3D** button beside the zoom draws the same game in Babylon.js. The prototype fetches the engine from jsDelivr on first use (the built site serves its own copy), pinned by version and SHA-384, and the game stays in 2D when it cannot load. After changing that version, update the hash in `prototype/index.html`: a test compares it with the installed package.

## Performance

Settings > **Graphe de performance** shows 30 s of what each frame costs on the main thread, by kind
(simulation, fog, 2D drawing, 3D view, interface, save), with the real time between frames and the
60 and 30 images a second lines. Hidden, nothing is measured. GPU time is not measured.

## Build the site

```sh
npm run build
npm run preview   # http://127.0.0.1:4173
```

An installable static site that plays offline. Deployment follows a published release: see [static site and releases](docs/static-site.md).

## Check

```sh
npx playwright install chromium   # once
npm run check
```

`npm test` replays the prototype in headless Chromium: belt motion, carbon and containers, sorters, bridges, gates, deposits and veins, breaches and damage, economy, construction by drone, dismantling and repair, the endless map, the preview under the pointer, worms, progression, nerves and the 3D view. Each run is seeded and compared with the recorded results in `tests/prototype/__snapshots__/`, and saves from earlier prototype versions must still load.

When a rule changes on purpose, rerun with `npm test -- -u` and read the snapshot diff before committing it: that diff is the gameplay change.

## Layout

| Path | Content |
|---|---|
| `prototype/` | The playable prototype, its 3D view (`view3d.js`, models in `models3d.js`, ground in `terrain3d.js`) and the transport mockup, French interface |
| `docs/design/interface/` | Approved mockup of the interface |
| `docs/concept.md` | Game concept and decisions |
| `tests/prototype/` | Behavior tests of the prototype |
| `tests/fixtures/saves/` | Saved games from earlier prototype versions |
| `site/`, `scripts/` | The static site: service worker, manifest, icons, build |
| `src/` | The product. Empty until the simulation is ported |
| `logics/` | Workflow corpus |
