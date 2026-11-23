# Public readiness

An audit of what the repository holds before it turns public. Run on 2026-11-23 over every tracked file and the
whole history.

## What was checked

| Check | Result |
|---|---|
| Host names, private network names, home paths | none in tracked files or history |
| Email addresses | only the commit author, as Git records it |
| Keys, tokens, passwords | none; the release workflow reads `github.token` and the `RENDER_DEPLOY_HOOK_URL` secret by name |
| Private repositories named in docs | none; `logics-manager` and `cdx-logics-kit` are public |
| Generated and local folders | `dist/`, `node_modules/` and `.*-artifacts/` are ignored |
| Third-party assets | none bundled: models, textures and sounds are drawn or synthesized by the code |
| Third-party code and fonts | Babylon.js (Apache 2.0) from npm, or jsDelivr pinned by hash; Barlow and Chakra Petch (SIL OFL) from Google Fonts |
| License | MIT, in `LICENSE` and `package.json` |

## How to run it again

```sh
git grep -nIiE "ts\.net|/home/|/Users/|@gmail|api[_-]?key|password|BEGIN [A-Z ]*PRIVATE KEY" -- . ':!package-lock.json'
git log --all -p | grep -iE "ts\.net|/home/|/Users/|BEGIN [A-Z ]*PRIVATE KEY"
```

Both print nothing on 2026-11-23.

## Before switching the repository to public

- The commit author email stays visible in history. Use a GitHub noreply address for future commits if that matters.
- The Render service and its deploy hook are unaffected by the visibility change.
