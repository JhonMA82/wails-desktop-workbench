import { useSyncExternalStore } from 'react';
import { ChevronDown, FileText, Folder } from 'lucide-react';
import { usePresentation } from '../contract/presentation';
import { Panel } from '../design-system/components/Panel';
import { CommandButton } from '../design-system/components/CommandButton';
export function PrimarySidebar() {
  const app = usePresentation(),
    docs = useSyncExternalStore(app.documents.state.subscribe, app.documents.state.snapshot);
  return (
    <Panel
      title="Resources"
      actions={<CommandButton registry={app.commands} id="document.open" iconOnly />}
    >
      <div className="tree" role="tree" aria-label="Workspace resources">
        <div className="tree-root">
          <ChevronDown size={13} />
          <Folder size={14} />
          <strong>DEMO WORKSPACE</strong>
        </div>
        {docs.open.map((doc) => (
          <button
            key={doc.id}
            role="treeitem"
            aria-selected={docs.active === doc.id}
            onClick={() => app.documents.activate(doc.id)}
          >
            <FileText size={14} />
            <span>{doc.title}</span>
            {doc.dirty && <span className="dirty-dot">●</span>}
          </button>
        ))}
        <p className="tree-hint">
          demo:// resources
          <br />
          No filesystem engine attached
        </p>
      </div>
    </Panel>
  );
}
