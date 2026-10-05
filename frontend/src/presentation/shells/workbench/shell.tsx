import { LayoutService } from './layout/layout-service';
import { DocumentTabs } from '../../views/DocumentTabs';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePresentation } from '../../contract/presentation';
import { DockingLayout } from './layout/DockingLayout';
import { PrimarySidebar } from '../../views/ExplorerPanel';
import { SecondarySidebar } from '../../views/InspectorPanel';
import { BottomPanel } from '../../views/BottomPanel';
import { EditorArea } from '../../views/EditorArea';
import { ActivityBar } from './components/ActivityBar';
import { SlimRibbon } from './components/SlimRibbon';
import { StatusBar } from '../../views/StatusBar';
import { OverlayHost } from '../../views/OverlayHost';
import { AppBar } from './components/AppBar';
import { EmptyState } from '../../design-system/components/Panel';
import { CommandButton } from '../../design-system/components/CommandButton';
import './shell.css';
export function WorkbenchShell() {
  const app = usePresentation(),
    settings = useSyncExternalStore(app.settings.subscribe, app.settings.snapshot),
    ui = useSyncExternalStore(app.ui.subscribe, app.ui.snapshot),
    workspace = useSyncExternalStore(app.workspace.state.subscribe, app.workspace.state.snapshot);
  useSyncExternalStore(app.documents.state.subscribe, app.documents.state.snapshot);
  const [small, setSmall] = useState(window.innerWidth < 900);
  useEffect(() => {
    const resize = () => setSmall(window.innerWidth < 900);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  if (!(app.layout instanceof LayoutService))
    throw new Error('WorkbenchShell requires its layout adapter');
  return (
    <div className={'app-shell ' + (ui.zen ? 'zen' : '')}>
      <AppBar />
      <SlimRibbon
        registry={app.commands}
        mode={
          ui.zen ? 'hidden' : small && settings.ribbonMode === 'full' ? 'slim' : settings.ribbonMode
        }
      />
      <main className="shell-body">
        {!ui.zen && <ActivityBar />}
        <div className="docking">
          {workspace.open ? (
            <DockingLayout
              service={app.layout}
              panel={(id) =>
                id === 'explorer' ? (
                  <PrimarySidebar />
                ) : id === 'inspector' ? (
                  <SecondarySidebar />
                ) : (
                  <BottomPanel id={id} />
                )
              }
              document={(id) => <EditorArea documentId={id} />}
              tabLabel={(id) => {
                const doc = app.documents.state.snapshot().open.find((d) => d.id === id);
                return doc ? <DocumentTabs document={doc} /> : null;
              }}
              onClose={(id) => {
                app.documents.activate(id);
                void app.commands.execute('document.close');
              }}
              onActivate={(id) => app.documents.activate(id)}
            />
          ) : (
            <>
              <EmptyState title="Workspace closed" />
              <CommandButton registry={app.commands} id="workspace.open" />
            </>
          )}
        </div>
      </main>
      <StatusBar />
      <OverlayHost />
    </div>
  );
}
