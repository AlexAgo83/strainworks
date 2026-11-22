# Static site

`npm run build` writes `dist/`: the game, its 3D engine, its pictures, a manifest and
a service worker that makes it installable and playable offline. `npm run preview`
serves it on `127.0.0.1:4173` with the headers of `render.yaml`.

Games are kept by each browser for each address. Export them to move them.

## Render, once

1. Create a Blueprint from this repository. `render.yaml` declares one free static
   site with auto-deploy off and no pull request previews.
2. Check on the service that Auto-Deploy is really off.
3. Put the service's deploy hook in the GitHub secret `RENDER_DEPLOY_HOOK_URL`,
   and its public URL in the repository variable `RENDER_SITE_URL`.

Creating the service makes a first deployment of main.

## Releasing

Deployment follows a published GitHub release `vX.Y.Z`, never a push. The sequence is
`release_sequence` in `logics/release/contract.json`. The workflow refuses a tag that
is not on main, does not match `package.json`, or has no green CI, then waits until
`version.json` on the site names the released commit.

A new version installs when the game is next closed and opened. An open game keeps
the files it started with.
