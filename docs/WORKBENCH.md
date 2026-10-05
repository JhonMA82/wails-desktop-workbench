# Workbench

## Shell

App Bar/project identity → compact Home/View/Tools Ribbon → Activity Bar + docking → Status Bar. Explorer, EditorArea/DocumentTabs, Inspector and bottom Problems/Output/Console/Jobs are available initially. Demo documents contain only a counter operation.

FlexLayout provides tabsets, alternating horizontal/vertical splits, resize, drag/drop, maximize, floating, browser popouts, pinned tabs and borders. `LayoutService` owns JSON restoration and panel transitions. Hiding removes the empty sidebar region; showing recreates the region. Collapse moves a sidebar into an overlay border. Floating state survives restoration. Popout content is rendered through the same React context.

`DockingLayout` supplies Lucide icons and document labels; Workbench CSS tokens map to FlexLayout's `--flexlayout-*` variables. The docking engine does not define the visual system. Native shell popout behaviour still needs validation on the target desktop; browser popout has an automated test.

## Commands and context

One `CommandRegistry` owns execution, title, category, icon, optional feature/keybinding, visibility (`when`) and availability (`enabled`). Ribbon, palette, menu/context menu, native menus and shortcuts dispatch its IDs. Native menu events only carry a Command ID and are checked by the registry.

Examples: `document.open`, `document.save`, `view.explorer.toggle`, `layout.reset`, `jobs.demo.start`, `jobs.demo.cancel`. Save enables only for a dirty document. Job start is disabled for untrusted workspaces and while a job is running. Workspace-open/close commands switch visibility.

Context includes workspace open/trusted, document open/dirty, editor focus, selection count, job running, sidebar visibility and history availability. Conditions are typed functions evaluated over a snapshot. Components do not repeat these conditions.

Full Ribbon shows category command groups. Slim keeps menu/categories and palette entry. Hidden removes the Ribbon. Below 900 px a full Ribbon becomes slim for that window without overwriting the user's persisted preference. Focus mode hides panels and Ribbon and restores the previous layout on exit.

## Documents and history

Each docking document tab contains `config.documentId`. Resource strings such as `demo://welcome` are not tab IDs or filesystem authority. DocumentService owns open/close/active/dirty/value. A dirty close asks before discarding. Values and dirty state are persisted as demo recovery.

UI commands may invoke a domain operation. They are not undo records. Each demo document receives a separate HistoryService; a new operation invalidates its redo branch. Layout undo/redo is separately bounded to 20 snapshots. Histories are session-only.

## Jobs and errors

The desktop Go runtime drives queued/running/completed/cancelled/failed jobs. Result and error are explicit. Frontend polling has an in-flight guard. Jobs appear in the Status Bar and Jobs panel. Tools includes intentional failure and cancellation commands. Trust is checked in both command availability and Go StartJob.

Errors from command execution, persistence, polling, `error` and `unhandledrejection` are recorded in diagnostics. The Problems panel shows them; Tools/Diagnostics displays runtime version/capabilities and a snapshot. Startup recovery corruption produces a visible startup failure rather than silently overwriting user state.

Keyboard shortcuts, focus outlines, accessible labels, Radix modal focus management, cmdk keyboard selection and reduced-motion CSS support the main operations. This is a desktop interface, not a mobile layout.

The Workbench UI lives in `presentation/shells/workbench`; shared views/primitives live under presentation. Shell-neutral Workbench services remain under `workbench`. Minimal consumes the same services without docking. See [PRESENTATION.md](PRESENTATION.md).
