# Security Policy

## Supported Versions

Security fixes target the current release line.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Reporting

Do not publish suspected vulnerabilities in a public issue. Report them privately through the
repository's security advisories, with the affected version, browser and OS, reproduction steps,
expected impact, and the smallest safe proof of concept.

Do not include credentials, private data, or unrelated local files in a report.

## Current Security Model

Strainworks is a static client application, deployed as files on Render's static hosting from a
published release. The site is `index.html`, hashed assets and a service worker served from `dist`,
under the headers of `render.yaml`: a strict Content-Security-Policy with no inline script, and no
framing. It has no backend, account system, server-side storage, telemetry or multiplayer. Games stay
in the browser's `localStorage`; the browser receives no project secrets.

The main surfaces are:

- dependencies installed from npm, and the Babylon.js engine (pinned by version and SHA-384 when the
  prototype fetches it, served from the site otherwise);
- the Render static site described by `render.yaml`;
- local browser storage and imported game files, which the player can edit and which are treated as
  untrusted input: an import is size-limited and validated, and never writes over an existing game;
- `scripts/serve-site.mjs`, which listens on loopback only and lets only the https origins it is
  explicitly given frame the site.

The model lab (`?lab`) is a development page: it edits a throwaway game in memory and saves nothing.
Any backend, cloud save, multiplayer or shared content work needs a new threat-model review before
release.
