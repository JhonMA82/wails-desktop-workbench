# Agent instructions

Architecture v1 is frozen. Read docs/ARCHITECTURE.md before structural changes. Avoid redesigning the boilerplate; require a concrete product friction for added infrastructure.

- UI components dispatch stable Command IDs; execute logic belongs in registration/application services.
- Only frontend/src/workbench/layout may import FlexLayout.
- Only frontend/src/platform/desktop-api may import Wails runtime/generated bindings.
- Router is high-level navigation. Documents, tabs, selection and docking are service-owned.
- Go application/runtime/persistence packages must stay Wails-free.
- Mandatory boilerplate dependencies must remain open source and commercially usable without paid runtime or developer licences.
- Keep exact dependency/tool versions and lockfiles. Regenerate bindings after changing bound signatures.
- Add tests for meaningful state transitions/contracts. Use task verify; do not call a failed run successful.
- For existing products, use an isolated branch/worktree for structural changes. No release before acceptance passes.
