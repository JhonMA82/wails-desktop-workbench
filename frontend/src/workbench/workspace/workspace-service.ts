import { ObservableValue } from '../../shared/utils/observable-value';
import type { WorkspaceRecord } from '../../shared/schemas/records';
import type { DocumentService } from '../documents/document-service';
import type { LayoutPort } from '../layout/layout-contract';
export class WorkspaceService {
  readonly state = new ObservableValue({
    id: 'demo',
    title: 'Demo Workspace',
    open: true,
    trust: 'trusted' as 'trusted' | 'untrusted',
  });
  constructor(
    readonly documents: DocumentService,
    readonly layout: LayoutPort,
  ) {}
  restore(v: WorkspaceRecord) {
    this.state.set({ id: v.id, title: v.title, trust: v.trust, open: true });
    this.documents.restore(v.documents, v.activeDocument);
    if (v.layout) this.layout.restore(JSON.parse(v.layout));
    this.layout.syncDocuments(v.documents, v.activeDocument);
  }
  serialize(): WorkspaceRecord {
    const v = this.state.snapshot(),
      docs = this.documents.state.snapshot();
    return {
      schemaVersion: 1,
      id: v.id,
      title: v.title,
      trust: v.trust,
      documents: docs.open,
      activeDocument: docs.active,
      layout: JSON.stringify(this.layout.save()),
    };
  }
  setTrust(trust: 'trusted' | 'untrusted') {
    this.state.set({ ...this.state.snapshot(), trust });
  }
  open() {
    this.state.set({ ...this.state.snapshot(), open: true });
  }
  close() {
    this.state.set({ ...this.state.snapshot(), open: false });
  }
}
