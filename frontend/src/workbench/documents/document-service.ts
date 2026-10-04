import { ObservableValue } from '../../shared/utils/observable-value';
import { resourceIdSchema, type DocumentRecord } from '../../shared/schemas/records';
export const demoDocument = (id = 'welcome'): DocumentRecord => ({
  id,
  resource: resourceIdSchema.parse('demo://' + id),
  title: id === 'welcome' ? 'Welcome' : 'Scratch ' + id.replace('scratch-', ''),
  type: 'demo',
  dirty: false,
  metadata: { format: 'Demo resource' },
  value: 0,
});
export class DocumentService {
  readonly state = new ObservableValue<{ open: DocumentRecord[]; active: string }>({
    open: [demoDocument()],
    active: 'welcome',
  });
  restore(open: DocumentRecord[], active: string) {
    const ids = new Set(open.map((d) => d.id));
    if (ids.size !== open.length || (active && !ids.has(active)))
      throw new Error('Invalid document recovery');
    this.state.set({ open, active });
  }
  open(document: DocumentRecord) {
    const v = this.state.snapshot();
    this.state.set({
      open: v.open.some((d) => d.id === document.id) ? v.open : [...v.open, document],
      active: document.id,
    });
  }
  activate(id: string) {
    const v = this.state.snapshot();
    if (v.open.some((d) => d.id === id) && v.active !== id) this.state.set({ ...v, active: id });
  }
  close(id: string) {
    const v = this.state.snapshot();
    const open = v.open.filter((d) => d.id !== id);
    this.state.set({ open, active: v.active === id ? (open.at(-1)?.id ?? '') : v.active });
  }
  active() {
    const v = this.state.snapshot();
    return v.open.find((d) => d.id === v.active);
  }
  change(id: string, value: number) {
    this.update(id, (d) => ({ ...d, value, dirty: true }));
  }
  save(id: string) {
    this.update(id, (d) => ({ ...d, dirty: false }));
  }
  private update(id: string, fn: (d: DocumentRecord) => DocumentRecord) {
    const v = this.state.snapshot();
    this.state.set({ ...v, open: v.open.map((d) => (d.id === id ? fn(d) : d)) });
  }
}
