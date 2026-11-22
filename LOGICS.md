# Logics Local Assistant Bridge

<!-- logics-manager:managed:start -->
This local file is refreshed by `logics-manager bootstrap`.
Canonical generated instructions live in `logics/instructions.md`.
If unmanaged notes in this file conflict with this section, follow this managed section.

Core rules:
- Read `logics/instructions.md` before editing workflow docs.
- Run `logics-manager bootstrap` after updating Logics Manager to refresh this bridge.
- Use `logics-manager --help` and subcommand `--help` for the current CLI contract.
- Do not hand-edit Logics indicators, lineage links, Mermaid signatures, or done status.

Inspection and validation:
- Use `logics-manager status` for the next work signal.
- Use `logics-manager health` for corpus-level anomalies.
- Run `logics-manager lint --require-status` and `logics-manager audit --group-by-doc` after workflow edits.
- Treat `# Priority` as an execution signal: choose High/Medium/Low deliberately with a short rationale, then plan higher-priority work first when dependencies allow.

Bounded context:
- Use `logics-manager sync read-doc <ref> --max-chars <n>` before opening large docs directly.
- Use `logics-manager sync list-docs`, `search-docs`, and `context-pack` for bounded discovery.

Workflow lifecycle:
- Use `logics-manager flow new|promote|start|closeout|finish` for request, backlog, and task lifecycle changes.
- Use `logics-manager flow start <ref>` before active implementation to mark `Status: In progress` and record `Owner`.
- Use `logics-manager flow progress task <ref> --progress <n>%` during multi-wave task work instead of editing `Progress` by hand.
- Use `logics-manager flow finish task <path>` instead of setting `Status: Done` manually.
- When delivery consumes a linked product brief, `flow closeout` should settle it; otherwise use `flow status product <ref> --status Settled --reason <text>` or Superseded instead of leaving it Proposed.

Use `logics-manager flow withdraw <ref> --reason <text>` to retire work without a replacement; it propagates Obsolete to eligible parents without claiming delivery. Keep `--superseded-by <ref>` for replacement withdrawals.

Use `logics-manager flow status <product|architecture|runbook|roadmap> <ref> --status <status> --reason <text>` for companion lifecycle changes; use Archived for retired runbooks. Preview either command with `--dry-run`.
- Treat task waves as ADR 009 checkpoints: update affected Logics docs in the wave and leave the repo commit-ready without forcing one commit per micro-step.
- Use `logics-manager sync refresh-mermaid-signatures` after editing Mermaid diagrams.

Release workflow:
- Use `logics-manager release status` before claiming release readiness.
- Use `logics-manager release plan <version>` and `logics-manager release validate <version>` for release checks.
- Record release proof with `logics-manager release evidence add ...`.
- Do not treat conversation memory or a successful command without matching evidence as release-ready proof.

Internationalization readiness:
- Use `logics-manager i18n status` before adding or restructuring user-facing copy.
- For a new UI project, use `logics-manager i18n init --source-locale <locale>`; one source locale is sufficient initially.
- Use `logics-manager i18n validate` after adopting the optional project-owned contract.
- Projects that own no user-facing copy may explicitly initialize the contract as not applicable.

Viewer and MCP:
- Use `logics-manager view` for the browser viewer and focus workflows.
- Use `logics-manager mcp ...` only when an MCP client surface is the right fit.

Document hygiene:
- Keep paths in Logics docs repo-relative, never absolute filesystem paths.
- Keep Mermaid labels plain ASCII, short, and free of raw route braces or inline code.
<!-- logics-manager:managed:end -->

# Project Context

Strainworks is a browser and mobile incremental factory game crossed with tower
defense. Read `docs/concept.md` before changing a rule: rows marked Decided or
Rejected are the operator's decisions, rows marked Proposed are open.

- `prototype/index.html` is the playable reference and is still iterated on, with
  a French interface. `prototype/view3d.js` is its 3D view (camera, lights, batching,
  read-outs) and `prototype/models3d.js` its models. Both only read the game state,
  and a new kind of object needs a model there as well as its 2D drawing.
- `tests/prototype/` records its behavior. An intended rule change updates the
  snapshot in the same commit and the concept with it. Never update a snapshot to
  silence a failure you cannot explain.
- Saved games from earlier versions must keep loading: the storage keys keep their
  old working name on purpose.
- `src/sim/` will hold the deterministic simulation, without DOM or renderer imports.
  `src/render/` may depend on it, never the reverse. Do not copy rules into a view.
- Chat with the operator in French. Docs, comments and commits are in English.
- Do not deploy, release or make the repository public without an explicit request.
- Run `npm run check` before pushing.
