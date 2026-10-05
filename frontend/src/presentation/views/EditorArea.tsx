import { useSyncExternalStore } from 'react';
import { Boxes, Command, Layers, Workflow } from 'lucide-react';
import { usePresentation } from '../contract/presentation';
import { Panel, EmptyState } from '../design-system/components/Panel';
import { CommandButton } from '../design-system/components/CommandButton';
import { CommandContextMenu } from '../design-system/components/CommandContextMenu';
export function EditorArea({ documentId }: { documentId: string }) {
  const app = usePresentation();
  const docs = useSyncExternalStore(app.documents.state.subscribe, app.documents.state.snapshot);
  const doc = docs.open.find((d) => d.id === documentId);
  if (!doc) return <EmptyState title="Document closed" />;
  return (
    <CommandContextMenu
      registry={app.commands}
      ids={[
        'document.demo.increment',
        'document.save',
        'history.undo',
        'history.redo',
        'document.close',
      ]}
    >
      <div
        tabIndex={0}
        className="editor-surface"
        onFocus={() => {
          app.documents.activate(documentId);
          app.context.set('editor.focused', true);
        }}
        onBlur={() => app.context.set('editor.focused', false)}
      >
        <Panel
          title={doc.resource}
          actions={<span className="muted">{doc.dirty ? '● Modified' : 'Saved'}</span>}
        >
          <div className="welcome">
            <p className="eyebrow">DESKTOP WORKBENCH / V1</p>
            <h1>
              Your next technical
              <br />
              application starts here.
            </h1>
            <p>
              A compact shell with explicit boundaries.
              <br />
              Add your domain without rebuilding the foundation.
            </p>
            <div className="capability-grid">
              <div>
                <Layers />
                <span>Dockable panels</span>
              </div>
              <div>
                <Command />
                <span>Shared commands</span>
              </div>
              <div>
                <Boxes />
                <span>Typed services</span>
              </div>
              <div>
                <Workflow />
                <span>Runtime adapters</span>
              </div>
            </div>
            <div className="operation-card">
              <div>
                <span className="section-label">DEMO DOCUMENT OPERATION</span>
                <p>
                  Value <strong data-testid="document-value">{doc.value}</strong>
                </p>
              </div>
              <CommandButton registry={app.commands} id="document.demo.increment" />
              <CommandButton registry={app.commands} id="history.undo" iconOnly />
              <CommandButton registry={app.commands} id="history.redo" iconOnly />
            </div>
            <div className="welcome-actions">
              <CommandButton registry={app.commands} id="document.open" />
              <CommandButton registry={app.commands} id="command.palette" />
            </div>
            <p className="shortcut-hint">MOD + O　Open　 ·　 MOD + SHIFT + P　Commands</p>
          </div>
        </Panel>
      </div>
    </CommandContextMenu>
  );
}
