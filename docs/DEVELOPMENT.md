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
| `task e2e` | Workbench browser smoke by default; `PRESENTATION_TEST_SHELL=minimal task e2e` selects Minimal (build/select that shell first) |
| `task frontend-build` | Build assets for the statically selected shell |
| `task presentations-verify` | Temporarily select/build/test Workbench and Minimal, then restore the original selection and assets |
| `task build` | Frontend assets + native Go binary in build/bin |
| `task verify` | Typecheck → lint → tests → both shell builds/E2E → selected native build |
| `task bindings` | Regenerate typed Wails interfaces |
| `task baseline` | Clean install/cache build, incremental build, Vite readiness/HMR, verify timings |

Go changes rebuild through `build/config.yml`; generated bindings must be refreshed when bound signatures change. Frontend HMR is provided by Vite. Taskfile applies GTK3 to Linux tasks only. The checked-in Wails dev rebuild command also explicitly includes `dev,gtk3`; review that command and executable path when configuring native development on another OS. No macOS/Windows launch validation is claimed.

E2E intentionally uses the browser fixture. Playwright does not reliably attach to this Wails GTK shell. Go tests cover real jobs/runtime cancellation/trust/persistence/diagnostics. Native window/menus/single-instance/close and desktop popouts must be exercised manually on the target desktop; this container cannot provide a working D-Bus Unix session. This is a validation limit, not a replacement of Wails.

## Add a feature

Create `frontend/src/features/<name>/` only when there is real domain code. Consume application service interfaces. Put Go use cases under `internal/app/<name>`. Keep domain behaviour independent of React/Wails; adapt through platform/desktop-api. Do not import FlexLayout or generated bindings from a feature.

## Add a panel

Add a stable PanelId/title in `frontend/src/workbench/layout/layout-contract.ts`. Register show/toggle commands in application composition and declare support in each applicable LayoutPort adapter. Place/render the content in that shell: Workbench uses its DockingLayout factory; Minimal uses explicit React regions. Unsupported panel commands are hidden through capability Context Keys. Reuse presentation Panel/PanelHeader; domain content belongs in its feature folder and exposes no FlexLayout nodes.

## Add a command

Register a stable ID and a single execute function in `register-commands.ts` or a feature's explicit registration function called by composition. Supply context predicates and category/icon/keybinding. Consume the ID with CommandButton, menu, palette or a native-menu event. Never reproduce the execute logic in a surface.

## Add a new interface

Follow [PRESENTATION.md](PRESENTATION.md): create a static shell/preset/LayoutPort, extend the explicit ShellId union, and register its render/build/browser checks. Theme and density remain independent. Switching between the two existing presets requires only changing `presentation/active.ts`; introducing a third preset also requires its typed ID and test registration.

The optional personal skill `add-presentation-shell` automates conversion preflight/scaffolding/checks when adding a new interface. It is installed separately, not shipped in this repository or run for routine UI edits. Its Node scripts live inside the skill package; repository verification remains in `scripts/` and Taskfile. The manual workflow here is sufficient without the skill.

## Repository navigation

`app/bootstrap` composes; `workbench` owns shell-neutral interaction services (the directory name is retained; visual components live in `presentation`); `platform/desktop-api` is the frontend native boundary; `presentation` owns shells/themes/density/shared visual primitives; `shared` only contains schema/subscription utilities. `internal/app` has Go use cases, `internal/runtime` the mock/contract, `internal/persistence` records, and `internal/platform` bindings/native shell. AGENTS.md provides a short change checklist. No empty architectural folders are created.

See [PRESENTATION.md](PRESENTATION.md) for static shell selection, HTML/Tailwind conversion and preference persistence. `task presentations-verify` tests both supplied shells and restores the current selection. Extend its explicit cases and `playwright.config.ts` when adding another shell.
