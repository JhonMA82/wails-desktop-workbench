# Acceptance / v1 freeze

The complete Task acceptance sequence passes on Linux amd64, Go 1.26.1, Wails v3.0.0-beta.27, Bun 1.3.10. Architecture v1 is frozen.

## Verified

- Strict TypeScript, ESLint, architectural import/version checks and Go vet.
- 9 frontend tests across 5 files: registry/context/shortcuts, Ribbon, documents/settings/layout restoration, history/trust, docking/pinning/floating and job UI.
- Go tests with `-race`: real job completion/cancellation/failure, runtime contract/progress/cancellation, settings/workspace/recovery, schema migration/future rejection, concurrent atomic writes, diagnostics and trust.
- Native Linux binary compiles successfully with official GTK3 support.
- 3 Playwright E2E scenarios: critical launch/document/panel/command/job/restart; cancellation/failure/trust/small-window; overlay border/floating persistence/browser popout.
- The same command implementation is reached through Ribbon, palette and shortcuts. Panel factories do not import the desktop transport; features cannot import FlexLayout.
- Dependency versions/lockfiles are retained and installed packages declare commercially usable OSS licences. See notices and inventories.

## Measured baseline

Ubuntu 24.04.3 Linux x64 container; 9 logical CPUs reported. Network/cache values are environment-specific; no performance target is asserted. Exact structured data: build/baseline.json; reproducible command: `task baseline`.

| Measurement | Duration | Scope |
|---|---:|---|
| cold-install | 52.076 s | Empty node_modules and isolated Bun cache; network included |
| cold-build | 40.677 s | Frontend + native Go build with empty GOCACHE; modules already downloaded |
| incremental-build | 4.7 s | Same source; existing Go cache |
| dev-startup | 0.45 s | Vite HTTP ready, not native window startup |
| frontend-hmr | 0.088 s | AppBar React module edit to visible update |
| verify | 24.249 s | Full Task acceptance suite |

## Validation limits and real pending checks

The native executable could not complete startup here: a standard D-Bus session socket is denied by the execution container. A TCP-session attempt also failed Wails single-instance initialization. No native window-open timing or native E2E success is claimed. Browser E2E is the explicitly allowed fallback and does not validate native WebKit transport, OS window/menu/close interactions, single-instance delivery or desktop popouts. Exercise those on the target desktop before calling a product release desktop-validated.

No stack decision was replaced. Linux GTK3 is an official Wails build option. Native file-open entry handles/logs the second instance arguments as an extension point; no real file editor/importer is bundled. Window restore currently covers size; platform-specific position/session integrations remain extension points, as allowed by the specification.

No domain engine, plugin system, AI/MCP, server, database, auth or cloud was added. Browser fixture jobs are explicit; production desktop uses Go JobService and MockRuntime.

## Actual repository structure

```text
build/
  baseline.json
  config.yml
  workbench-initial.png
  workbench-preview.png
docs/
  ARCHITECTURE.md
  DEVELOPMENT.md
  GO_LICENSES.json
  NPM_LICENSES.json
  RUNTIME.md
  THIRD_PARTY_NOTICES.md
  WORKBENCH.md
frontend/
  bindings/
    github.com/
      wailsapp/
    workbench/
      internal/
  public/
    popout.html
  src/
    app/
      bootstrap/
      providers/
      router/
    platform/
      desktop-api/
    shared/
      schemas/
      ui/
      utils/
    workbench/
      activity-bar/
      commands/
      context/
      dialogs/
      documents/
      history/
      jobs/
      keybindings/
      layout/
      menus/
      notifications/
      palette/
      panels/
      ribbon/
      shell/
      status/
      workspace/
    main.tsx
    styles.css
    test-setup.ts
  index.html
  tsconfig.json
  vite.config.ts
internal/
  app/
    diagnostics/
      diagnostics.go
    documents/
      document.go
    jobs/
      jobs.go
      jobs_test.go
    settings/
      settings.go
    trust/
      trust.go
    workspace/
      workspace.go
  persistence/
    store.go
  platform/
    host.go
    host_test.go
    window.go
  runtime/
    mock.go
    mock_test.go
    runtime.go
scripts/
  baseline.mjs
  boundaries.mjs
tests/
  workbench.spec.ts
.gitignore
.prettierignore
.prettierrc.json
.tool-versions
AGENTS.md
LICENSE
README.md
Taskfile.yml
bun.lock
components.json
eslint.config.js
go.mod
go.sum
main.go
package-lock.json
package.json
playwright.config.ts
```
