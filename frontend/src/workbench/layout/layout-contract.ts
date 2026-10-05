export type PanelId = 'explorer' | 'inspector' | 'problems' | 'output' | 'console' | 'jobs';
export type PanelState = 'open' | 'collapsed' | 'overlay' | 'hidden' | 'floating';
export const panelTitles: Record<PanelId, string> = {
  explorer: 'Explorer',
  inspector: 'Inspector',
  problems: 'Problems',
  output: 'Output',
  console: 'Console',
  jobs: 'Jobs',
};
// Application owns panel intentions; each presentation owns its layout representation.
export interface LayoutPort {
  readonly capabilities: { floating: boolean; collapse: boolean; panels: readonly PanelId[] };
  subscribe(fn: () => void): () => void;
  snapshot(): number;
  save(): unknown;
  restore(value: unknown): void;
  reset(): void;
  record(): void;
  undo(): void;
  redo(): void;
  state(id: PanelId): PanelState;
  visible(id: PanelId): boolean;
  toggle(id: PanelId): void;
  show(id: PanelId): void;
  hide(id: PanelId): void;
  collapse(id: PanelId): void;
  float(id: PanelId): void;
  syncDocuments(docs: { id: string; title: string }[], active?: string): void;
}
