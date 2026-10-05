# Presentation

Application owns behaviour; presentation owns structure, appearance and density. Both shells reuse the existing services through `presentation/contract/presentation.ts`, a narrowed view of ApplicationServices. It is an import boundary, not a second API or store. The composition entry point supplies a layout adapter to `createApplication`.

| Change | Owner |
|---|---|
| Product-wide arrangement | `presentation/shells/<name>` |
| Colors, fonts, radii | `presentation/themes` |
| Spacing, controls, tabs, toolbar, list/header sizes | `presentation/density` |
| Generic primitives, menus, palette, dialogs, toasts, icons | `presentation/design-system` |
| Shared document/explorer/inspector content | `presentation/views` |
| Behaviour, commands, documents, jobs | Existing Application/Workbench services |

## Static shell choice

Edit the single export in `frontend/src/presentation/active.ts`:

```ts
export { AppShell, createLayout, presentation } from './shells/minimal/preset';
```

Use `./shells/workbench/preset` for the default. No runtime shell registry, loader, feature flags or user shell selector exists. Each preset exports its shell, a layout factory and a typed product selection. High-level routing is shared.

Workbench retains Ribbon, Activity Bar and docking. FlexLayout imports/styles live only in its layout adapter. Minimal uses flexbox, a toolbar, document tabs, sidebars and a Jobs surface; it never imports Workbench or FlexLayout. Its unavailable floating/border-collapse and absent panel actions are hidden by registry Context Keys. LayoutPort describes real panel/persistence intentions, not a universal layout engine. Document IDs and state remain service-owned.

The two supplied adapters preserve each other's opaque layout snapshot. Workbench keeps its previous JSON shape; Minimal adds a versioned `minimalLayout` entry. Switching product selection preserves documents/settings, and returning to a shell restores its layout. No backend migration is needed.

## Theme and density

Graphite and Light override semantic color tokens. Compact and Comfortable independently override structural sizes. The two shells support independent theme/density selection. Unit tests exercise preference application for all eight combinations; browser smoke covers Workbench and Minimal, including Minimal Light/Comfortable, rather than visual screenshots of every combination. `preferences.ts` applies root attributes; theme never changes services or DOM structure.

User settings expose theme/density. The existing `dark` wire value displays as Graphite, retaining Go settings compatibility. Density defaults to Compact for old records. Browser preview stores density in its versioned settings fixture. Native stores only the added density preference in versioned WebView localStorage (`workbench.presentation.user`); existing theme/Ribbon/restore fields continue through Go settings. This avoids changing Go or generated bindings. Clearing WebView data resets density. Layout is never stored in global user preferences.

## Add a shell / convert HTML + Tailwind

1. Scaffold a small folder beside Minimal; copy structure only, not service implementations.
2. Convert HTML to semantic React components (className, labels, stable keys); retain keyboard/focus states and reduced-motion support.
3. Replace click handlers with existing Command IDs via CommandButton/registry. Add genuinely new behaviour in Application registration, never inline in the shell.
4. Consume existing services through the presentation contract. Replace mock document/job/settings state with their snapshots; keep only local visual state in React.
5. Reuse primitives and Lucide. Map template colors/font/radius to theme tokens and repeated sizes to density tokens; do not import an extra icon set or copy Tailwind configuration wholesale.
6. Use local CSS/flex/grid unless the product actually needs docking. Implement LayoutPort only for supported intentions and expose capability Context Keys; do not import FlexLayout through feature content.
7. Extend the explicit `ShellId` union in `frontend/src/presentation/contract/shell.ts` and export a typed preset. Add render/shared-command tests, a browser smoke in `tests/`, and explicit shell cases in `scripts/verify-presentations.mjs` and `playwright.config.ts`; the existing runner only enumerates Workbench and Minimal.
8. Select the preset in `frontend/src/presentation/active.ts` and run `task verify` without a dev server. Verify restoration of the original selection after multi-shell checks. Preserve foreign layout snapshots explicitly if the new product must switch back to an existing shell.

A shell must not own jobs, document mutations, trust rules, application persistence, runtime adapters, raw Wails calls or a duplicate command registry. Its layout adapter may serialize/restore its own layout via LayoutPort; WorkspaceService still owns saving the workspace record. A template's demo data and client-side business handlers must be removed during conversion.

The optional separately installed `add-presentation-shell` skill activates only for a new interface/template. Its scripts scaffold and validate the conversion; they do not add a runtime loader or replace the repository's acceptance suite. See [DEVELOPMENT.md](DEVELOPMENT.md).

## Checks

`task verify` checks imports, both shell render tests, shared command/document/job behaviour, recovery and all preference combinations. `task presentations-verify` temporarily selects each shell, builds it and runs its browser smoke, checks docking CSS is absent from Minimal, then restores the original selection and assets in a finally block. The native build uses the restored product selection. Run verification without a development server. Browser fixtures do not claim native Wails automation; existing Go race tests cover backend behaviour.
