import { Actions, DockLocation, Model, TabNode, type IJsonModel } from 'flexlayout-react';
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
const tab = (id: PanelId) => ({
  type: 'tab' as const,
  id,
  name: panelTitles[id],
  component: 'panel',
  config: { panelId: id },
  enableClose: false,
});
export function defaultLayout(): IJsonModel {
  return {
    global: {
      tabEnableFloat: true,
      tabEnableFloatIcon: true,
      tabEnablePopout: true,
      tabEnablePopoutIcon: true,
      tabEnablePin: true,
      tabSetEnableDeleteWhenEmpty: true,
    },
    borders: [
      { type: 'border', location: 'left', borderType: 'overlay', children: [] },
      { type: 'border', location: 'right', borderType: 'overlay', children: [] },
      { type: 'border', location: 'bottom', children: [] },
    ],
    layout: {
      type: 'row',
      children: [
        { type: 'tabset', id: 'primary', weight: 19, children: [tab('explorer')] },
        {
          type: 'row',
          weight: 61,
          children: [
            {
              type: 'tabset',
              id: 'editor',
              enableDeleteWhenEmpty: false,
              weight: 74,
              children: [
                {
                  type: 'tab',
                  id: 'doc-welcome',
                  name: 'Welcome',
                  component: 'document',
                  config: { documentId: 'welcome' },
                },
              ],
            },
            {
              type: 'tabset',
              id: 'bottom',
              weight: 26,
              children: [tab('problems'), tab('output'), tab('console'), tab('jobs')],
            },
          ],
        },
        { type: 'tabset', id: 'secondary', weight: 20, children: [tab('inspector')] },
      ],
    },
  };
}
export class LayoutService {
  model = Model.fromJson(defaultLayout());
  private listeners = new Set<() => void>();
  private revision = 0;
  private previous: IJsonModel[] = [];
  private next: IJsonModel[] = [];
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  snapshot = () => this.revision;
  changed = () => {
    this.revision++;
    this.listeners.forEach((fn) => fn());
  };
  save = () => this.model.toJson();
  restore(value: unknown) {
    this.model = Model.fromJson(value as IJsonModel);
    this.changed();
  }
  reset() {
    this.record();
    this.restore(defaultLayout());
  }
  record() {
    this.previous.push(this.save());
    this.previous = this.previous.slice(-20);
    this.next = [];
  }
  undo() {
    const value = this.previous.pop();
    if (value) {
      this.next.push(this.save());
      this.restore(value);
    }
  }
  redo() {
    const value = this.next.pop();
    if (value) {
      this.previous.push(this.save());
      this.restore(value);
    }
  }
  state(id: PanelId): PanelState {
    const node = this.model.getNodeById(id);
    if (!node) return 'hidden';
    const parent = node.getParent();
    if (parent?.getType() === 'border')
      return node instanceof TabNode && node.isVisible() ? 'overlay' : 'collapsed';
    if (node instanceof TabNode && node.getLayoutId() !== Model.MAIN_LAYOUT_ID) return 'floating';
    return 'open';
  }
  visible(id: PanelId) {
    return !!this.model.getNodeById(id);
  }
  toggle(id: PanelId) {
    if (this.state(id) === 'collapsed') this.expand(id);
    else if (this.visible(id)) this.hide(id);
    else this.show(id);
  }
  private target(id: PanelId) {
    return id === 'explorer' ? 'primary' : id === 'inspector' ? 'secondary' : 'bottom';
  }
  private apply(action: ReturnType<typeof Actions.selectTab>) {
    this.model.doAction(action);
    this.changed();
  }
  hide(id: PanelId) {
    this.record();
    this.apply(Actions.deleteTab(id));
  }
  private home(id: PanelId) {
    const named = this.model.getNodeById(this.target(id));
    if (named) return { target: named.getId(), location: DockLocation.CENTER };
    const target = this.model.getNodeById('editor') ?? this.model.getFirstTabSet();
    return {
      target: target?.getId(),
      location:
        id === 'explorer'
          ? DockLocation.LEFT
          : id === 'inspector'
            ? DockLocation.RIGHT
            : DockLocation.BOTTOM,
    };
  }
  show(id: PanelId) {
    if (this.visible(id)) {
      this.apply(Actions.selectTab(id));
      return;
    }
    this.record();
    const home = this.home(id);
    if (home.target) this.apply(Actions.addTab(tab(id), home.target, home.location, -1));
  }
  expand(id: PanelId) {
    const home = this.home(id);
    if (home.target) {
      this.record();
      this.apply(Actions.moveNode(id, home.target, home.location, -1));
    }
  }
  collapse(id: PanelId) {
    if (!this.visible(id)) return;
    this.record();
    this.apply(
      Actions.moveNode(
        id,
        id === 'explorer' ? 'border_left' : id === 'inspector' ? 'border_right' : 'border_bottom',
        DockLocation.CENTER,
        -1,
        false,
      ),
    );
  }
  float(id: PanelId) {
    if (this.visible(id)) {
      this.record();
      this.apply(Actions.popoutTab(id, 'float'));
    }
  }
  syncDocuments(docs: { id: string; title: string }[], active?: string) {
    const keep = new Set(docs.map((d) => 'doc-' + d.id));
    const stale: string[] = [];
    this.model.visitNodes((n) => {
      if (n instanceof TabNode && n.getComponent() === 'document' && !keep.has(n.getId()))
        stale.push(n.getId());
    });
    stale.forEach((id) => this.model.doAction(Actions.deleteTab(id)));
    docs.forEach((d) => {
      const id = 'doc-' + d.id;
      if (!this.model.getNodeById(id)) {
        const target = this.model.getNodeById('editor')
          ? 'editor'
          : this.model.getActiveTabset()?.getId();
        if (target)
          this.model.doAction(
            Actions.addTab(
              {
                type: 'tab',
                id,
                name: d.title,
                component: 'document',
                config: { documentId: d.id },
              },
              target,
              DockLocation.CENTER,
              -1,
            ),
          );
      }
    });
    if (active && this.model.getNodeById('doc-' + active))
      this.model.doAction(Actions.selectTab('doc-' + active));
    this.changed();
  }
}
