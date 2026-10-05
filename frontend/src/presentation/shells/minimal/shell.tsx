import { useSyncExternalStore } from 'react';
import { Link, usePresentation } from '../../contract/presentation';
import { CommandButton } from '../../design-system/components/CommandButton';
import { OverlayHost } from '../../views/OverlayHost';
import { StatusBar } from '../../views/StatusBar';
import { EmptyState } from '../../design-system/components/Panel';
import { PrimarySidebar } from '../../views/ExplorerPanel';
import { SecondarySidebar } from '../../views/InspectorPanel';
import { EditorArea } from '../../views/EditorArea';
import { DocumentTabs } from '../../views/DocumentTabs';
import { BottomPanel } from '../../views/BottomPanel';
import './shell.css';
export function MinimalShell() {
  const app = usePresentation();
  const docs = useSyncExternalStore(app.documents.state.subscribe, app.documents.state.snapshot);
  const workspace = useSyncExternalStore(
    app.workspace.state.subscribe,
    app.workspace.state.snapshot,
  );
  const ui = useSyncExternalStore(app.ui.subscribe, app.ui.snapshot);
  useSyncExternalStore(app.layout.subscribe, app.layout.snapshot);
  return (
    <div className="minimal-shell" data-testid="minimal-shell">
      <header className="minimal-header">
        <strong>MINIMAL</strong>
        <span>{workspace.title}</span>
        <nav aria-label="Application">
          <Link to="/settings">Settings</Link>
          <CommandButton registry={app.commands} id="command.palette" iconOnly />
        </nav>
      </header>
      <div className="minimal-toolbar" role="toolbar" aria-label="Commands">
        {[
          'document.open',
          'document.save',
          'document.close',
          'view.explorer.toggle',
          'view.inspector.toggle',
          'jobs.demo.start',
          'jobs.demo.cancel',
          'view.zen',
        ].map((id) => (
          <CommandButton key={id} registry={app.commands} id={id} />
        ))}
      </div>
      <main className="minimal-body">
        {!ui.zen && app.layout.visible('explorer') && (
          <aside aria-label="Explorer" className="minimal-sidebar">
            <PrimarySidebar />
          </aside>
        )}
        <section className="minimal-content" aria-label="Documents">
          {workspace.open ? (
            <>
              <div className="minimal-tabs" role="tablist" aria-label="Open documents">
                {docs.open.map((doc) => (
                  <button
                    key={doc.id}
                    role="tab"
                    aria-selected={doc.id === docs.active}
                    onClick={() => app.documents.activate(doc.id)}
                  >
                    <DocumentTabs document={doc} />
                  </button>
                ))}
              </div>
              {docs.active ? (
                <EditorArea documentId={docs.active} />
              ) : (
                <EmptyState title="No document open" />
              )}
            </>
          ) : (
            <>
              <EmptyState title="Workspace closed" />
              <CommandButton registry={app.commands} id="workspace.open" />
            </>
          )}
        </section>
        {!ui.zen && app.layout.visible('inspector') && (
          <aside aria-label="Inspector" className="minimal-sidebar">
            <SecondarySidebar />
          </aside>
        )}
      </main>
      {!ui.zen && app.layout.visible('jobs') && (
        <section className="minimal-jobs" aria-label="Jobs">
          <BottomPanel id="jobs" />
        </section>
      )}
      <StatusBar />
      <OverlayHost />
    </div>
  );
}
