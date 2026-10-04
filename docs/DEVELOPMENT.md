# Development

## Pinned toolchain

| Tool | Version |
|---|---|
| Go | 1.26.1 |
| Wails | v3.0.0-beta.27 (prerelease) |
| Bun | 1.3.10 |
| Task | 3.45.4 |
| React | 19.2.0 |
| TanStack Router | 1.132.0 |
| FlexLayout | 0.11.1 |
| Vite | 7.1.9 |

All other direct npm versions are exact in package.json. bun.lock and go.sum lock the graph. The optional package-lock.json records the bootstrap npm install; Bun/Task are the operational surface.

Install Go/Bun/Task and add Go's bin directory to PATH. Install the exact Wails CLI as in README. Linux uses official `gtk3` build tags and requires GTK3/WebKitGTK 4.1 headers and a desktop D-Bus session:

```sh
sudo apt install build-essential pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev dbus-x11
task install
bunx --no-install playwright install chromium
```

Use native Wails prerequisites for macOS/Windows. Build/launch validation in this delivery was on Linux; other operating systems are not claimed tested.

## One operational surface

| Task | Operation |
|---|---|
| `task dev` | Wails host, bindings, Vite HMR and Go rebuilds |
| `task web` | Explicit UI preview at `/?preview=1` |
| `task typecheck` | Strict TypeScript |
| `task lint` | ESLint, import boundaries, pinned dependency check, Go vet |
| `task test` | Vitest/Testing Library and Go race tests |
| `task e2e` | Playwright critical UI smoke |
| `task build` | Frontend assets + native Go binary in build/bin |
| `task verify` | Typecheck → lint → tests → build → E2E |
| `task bindings` | Regenerate typed Wails interfaces |
| `task baseline` | Clean install/cache build, incremental build, Vite readiness/HMR, verify timings |

Go changes rebuild through `build/config.yml`; generated bindings must be refreshed when bound signatures change. Frontend HMR is provided by Vite. The Linux dev config passes GTK3; remove that tag in the dev command on macOS/Windows if needed (Go ignores the GTK3-specific code there).

E2E intentionally uses the browser fixture. Playwright does not reliably attach to this Wails GTK shell. Go tests cover real jobs/runtime cancellation/trust/persistence/diagnostics. Native window/menus/single-instance/close and desktop popouts must be exercised manually on the target desktop; this container cannot provide a working D-Bus Unix session. This is a validation limit, not a replacement of Wails.

## Add a feature

Create `frontend/src/features/<name>/` only when there is real domain code. Consume application service interfaces. Put Go use cases under `internal/app/<name>`. Keep domain behaviour independent of React/Wails; adapt through platform/desktop-api. Do not import FlexLayout or generated bindings from a feature.

## Add a panel

Add a stable PanelId/title and initial placement or command in the layout adapter; supply its renderer through the Workbench panel factory. Reuse WorkbenchPanel/PanelHeader. Register show/toggle actions in the composition root. A feature only exposes content and services, not FlexLayout nodes. Domain UI belongs in its feature folder.

## Add a command

Register a stable ID and a single execute function in `register-commands.ts` or a feature's explicit registration function called by composition. Supply context predicates and category/icon/keybinding. Consume the ID with CommandButton, menu, palette or a native-menu event. Never reproduce the execute logic in a surface.

## Repository navigation

`app/bootstrap` composes; `workbench` owns infrastructure; `platform/desktop-api` is the frontend native boundary; `shared` only contains UI/schema/subscription utilities. `internal/app` has Go use cases, `internal/runtime` the mock/contract, `internal/persistence` records, and `internal/platform` bindings/native shell. AGENTS.md provides a short change checklist. No empty architectural folders are created.
