import { useSyncExternalStore } from 'react';
import { useApplication } from '../../app/providers/ApplicationProvider';
import { WorkbenchPanel, EmptyState } from './WorkbenchPanel';
export function PropertiesPanel({ values }: { values: Record<string, string> }) {
  return (
    <dl className="properties">
      {Object.entries(values).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function SecondarySidebar() {
  const app = useApplication();
  useSyncExternalStore(app.documents.state.subscribe, app.documents.state.snapshot);
  const doc = app.documents.active();
  return (
    <WorkbenchPanel title="Document properties">
      {doc ? (
        <>
          <div className="section-label">RESOURCE</div>
          <PropertiesPanel
            values={{
              Title: doc.title,
              Type: doc.type,
              Resource: doc.resource,
              State: doc.dirty ? 'Modified' : 'Saved',
            }}
          />
          <div className="section-label">DEMO OPERATION</div>
          <PropertiesPanel values={{ Value: String(doc.value), History: 'Document owned' }} />
        </>
      ) : (
        <EmptyState
          title="No active document"
          detail="Open a demo document to inspect its properties."
        />
      )}
    </WorkbenchPanel>
  );
}
