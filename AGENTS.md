# Agent instructions

The existing application architecture v1 remains frozen; presentation is replaceable through explicit static presets. Read docs/ARCHITECTURE.md before structural changes. Avoid redesigning the boilerplate; require a concrete product friction for added infrastructure.

- UI components dispatch stable Command IDs; execute logic belongs in registration/application services.
- Only frontend/src/presentation/shells/workbench/layout may import FlexLayout.
- Only frontend/src/platform/desktop-api may import Wails runtime/generated bindings.
- Router is high-level navigation. Documents, tabs, selection and docking are service-owned.
- Go application/runtime/persistence packages must stay Wails-free.
- Mandatory boilerplate dependencies must remain open source and commercially usable without paid runtime or developer licences.
- Keep exact dependency/tool versions and lockfiles. Regenerate bindings after changing bound signatures.
- Add tests for meaningful state transitions/contracts. Use task verify; do not call a failed run successful.
- For existing products, use an isolated branch/worktree for structural changes. No release before acceptance passes.

## Change ownership

- Functionality → feature/application services; reuse Command IDs.
- OS/Wails integration → platform/backend.
- Global UI structure → presentation/shells.
- Appearance → presentation/themes; density → presentation/density.
- Application must not import a concrete presentation; presentation uses its existing-service contract.
- Read docs/PRESENTATION.md before adapting HTML/Tailwind or adding a shell. Never copy mock business state into a shell.
