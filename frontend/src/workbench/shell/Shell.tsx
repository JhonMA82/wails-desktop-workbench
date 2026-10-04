import { DocumentTabs } from '../documents/DocumentTabs';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useApplication } from '../../app/providers/ApplicationProvider';
import { DockingLayout } from '../layout/DockingLayout';
import { PrimarySidebar } from '../panels/ExplorerPanel';
import { SecondarySidebar } from '../panels/InspectorPanel';
import { BottomPanel } from '../panels/BottomPanel';
import { EditorArea } from '../documents/EditorArea';
import { ActivityBar } from '../activity-bar/ActivityBar';
import { SlimRibbon } from '../ribbon/SlimRibbon';
import { StatusBar } from '../status/StatusBar';
import { OverlayHost } from '../dialogs/OverlayHost';
import { AppBar } from './AppBar';
import { EmptyState } from '../panels/WorkbenchPanel';
import { CommandButton } from '../commands/CommandButton';
export function Shell() {
  const app = useApplication(),
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
