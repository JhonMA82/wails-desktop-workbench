# Acceptance / v1 freeze

Presentation refactor validated on 2026-10-05: `task verify` passed in 50.41 s; 16 frontend tests, existing Go race tests, 3 Workbench E2E scenarios and 1 Minimal E2E scenario passed. Both presentations and the selected Linux native app build. Go source, bindings, dependency versions and lockfiles are unchanged. See [PRESENTATION.md](PRESENTATION.md) and VERIFICATION.txt.

Application architecture v1 remains frozen. Presentation is selected through static presets; this does not change Go services or introduce a runtime registry.

## Verified in the presentation refactor

- Strict TypeScript, ESLint, architectural import/version checks and Go vet.
- 16 frontend tests across 6 files, including both shell renders, shared command/document/job behaviour, preferences, layout restoration and Workbench docking.
- Go tests with `-race`: jobs, runtime progress/cancellation/failure, persistence/migrations, atomic writes, diagnostics and trust.
- 3 Workbench browser scenarios: critical workspace/document/panel/command/job/restart; cancellation/failure/trust/small-window; overlay/floating restoration/browser popout.
- 1 Minimal browser scenario: shared commands/jobs, preference restoration and layout controls. Minimal production assets exclude FlexLayout CSS.
- Both frontend presets and the selected Linux native binary compile. Native launch limitations below still apply.
- Exact dependencies and lockfiles are retained; licence inventories/notices are unchanged.

Documentation was subsequently reconciled with source paths, Taskfile and the static shell contract. That documentation-only review is not a new full acceptance or performance measurement.

## Historical original-v1 performance baseline

Ubuntu 24.04.3 Linux x64 container; 9 logical CPUs reported. Network/cache values are environment-specific; no performance target is asserted. Exact structured data: build/baseline.json; reproducible command: `task baseline`.

| Measurement | Duration | Scope |
|---|---:|---|
| cold-install | 52.076 s | Empty node_modules and isolated Bun cache; network included |
| cold-build | 40.677 s | Frontend + native Go build with empty GOCACHE; modules already downloaded |
| incremental-build | 4.7 s | Same source; existing Go cache |
| dev-startup | 0.45 s | Vite HTTP ready, not native window startup |
| frontend-hmr | 0.088 s | AppBar React module edit to visible update |
| verify | 24.249 s | Original-v1 suite, before multi-shell acceptance |

## Validation limits and real pending checks

The native executable could not complete startup here: a standard D-Bus session socket is denied by the execution container. A TCP-session attempt also failed Wails single-instance initialization. No native window-open timing or native E2E success is claimed. Browser E2E is the explicitly allowed fallback and does not validate native WebKit transport, OS window/menu/close interactions, single-instance delivery or desktop popouts. Exercise those on the target desktop before calling a product release desktop-validated.

No stack decision was replaced. Linux GTK3 is an official Wails build option. Native file-open entry handles/logs the second instance arguments as an extension point; no real file editor/importer is bundled. Window restore currently covers size; platform-specific position/session integrations remain extension points, as allowed by the specification.

No domain engine, plugin system, AI/MCP, server, database, auth or cloud was added. Browser fixture jobs are explicit; production desktop uses Go JobService and MockRuntime.

## Current repository navigation

```text
frontend/src/
  app/                 bootstrap, providers, high-level router
  presentation/
    contract/          service view and static shell types
    shells/
      workbench/       Ribbon, Activity Bar, FlexLayout adapter
      minimal/         toolbar, explicit regions, MinimalLayout
    themes/            Graphite and Light
    density/           Compact and Comfortable
    design-system/     shared primitives, menus, palette, icons
    views/             shared document, panel and settings views
  workbench/           commands, context, documents, history, jobs,
                       layout contract, workspace and interaction services
  platform/desktop-api/ native API and explicit browser fixture
  shared/              schemas and subscription utilities
frontend/bindings/      generated Wails bindings
internal/
  app/                 diagnostics, documents, jobs, settings, trust, workspace
  persistence/         atomic versioned records
  platform/            host bindings and native window
  runtime/             Adapter and MockRuntime
scripts/               boundaries, baseline, verify-presentations
tests/                 Workbench and Minimal Playwright smoke
docs/                  architecture, presentation, development, runtime,
                       Workbench, acceptance and licence inventories
build/                 Wails config, screenshots and historical baseline
Taskfile.yml           operational commands
```

`features/` is created only when a product adds actual domain code; no empty folder is included. See [DEVELOPMENT.md](DEVELOPMENT.md) for additions and [PRESENTATION.md](PRESENTATION.md) for interface conversion.
