import { ObservableValue } from '../../../shared/utils/observable-value';
import {
  panelTitles,
  type LayoutPort,
  type PanelId,
  type PanelState,
} from '../../../workbench/layout/layout-contract';
import { z } from 'zod';
const stateSchema = z.object({
  schemaVersion: z.literal(1),
  panels: z.record(z.enum(Object.keys(panelTitles) as [PanelId, ...PanelId[]]), z.boolean()),
});
const defaults = () => ({
  schemaVersion: 1 as const,
  panels: {
    explorer: true,
    inspector: true,
    problems: true,
    output: true,
    console: true,
    jobs: true,
  },
});
// Preserve the opaque Workbench snapshot while storing only Minimal's own panel visibility.
export class MinimalLayout implements LayoutPort {
  readonly capabilities = {
    floating: false,
    collapse: false,
    panels: ['explorer', 'inspector', 'jobs'] as const,
  };
  private value = defaults();
  private foreign: Record<string, unknown> = {};
  private revision = new ObservableValue(0);
  private previous: ReturnType<typeof defaults>[] = [];
  private next: ReturnType<typeof defaults>[] = [];
  subscribe = this.revision.subscribe;
  snapshot = this.revision.snapshot;
  private changed() {
    this.revision.set(this.revision.snapshot() + 1);
  }
  save() {
    return { ...this.foreign, minimalLayout: structuredClone(this.value) };
  }
  restore(value: unknown) {
    this.foreign = value && typeof value === 'object' ? { ...value } : {};
    const parsed = stateSchema.safeParse(this.foreign.minimalLayout);
    this.value = parsed.success
      ? { ...defaults(), panels: { ...defaults().panels, ...parsed.data.panels } }
      : defaults();
    delete this.foreign.minimalLayout;
    this.changed();
  }
  record() {
    this.previous.push(structuredClone(this.value));
    this.previous = this.previous.slice(-20);
    this.next = [];
  }
  reset() {
    this.record();
    this.value = defaults();
    this.changed();
  }
  undo() {
    const v = this.previous.pop();
    if (v) {
      this.next.push(this.value);
      this.value = v;
      this.changed();
    }
  }
  redo() {
    const v = this.next.pop();
    if (v) {
      this.previous.push(this.value);
      this.value = v;
      this.changed();
    }
  }
  state(id: PanelId): PanelState {
    return this.visible(id) ? 'open' : 'hidden';
  }
  visible(id: PanelId) {
    return this.value.panels[id];
  }
  private set(id: PanelId, visible: boolean) {
    if (this.visible(id) === visible) return;
    this.record();
    this.value = { ...this.value, panels: { ...this.value.panels, [id]: visible } };
    this.changed();
  }
  show(id: PanelId) {
    this.set(id, true);
  }
  hide(id: PanelId) {
    this.set(id, false);
  }
  toggle(id: PanelId) {
    this.set(id, !this.visible(id));
  }
  collapse() {
    throw new Error('Minimal has no collapsed borders');
  }
  float() {
    throw new Error('Minimal has no floating panels');
  }
  syncDocuments() {} // DocumentService owns tabs; Minimal has no docking document nodes.
}
