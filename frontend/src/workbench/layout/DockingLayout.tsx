import { useSyncExternalStore, type ReactNode } from 'react';
import { Actions, Layout, type TabNode } from 'flexlayout-react';
import { X, Maximize2, Minimize2, ExternalLink, Pin, Ellipsis, PanelsTopLeft } from 'lucide-react';
import { type LayoutService, type PanelId } from './layout-service';
import 'flexlayout-react/style/dark.css';
export function DockingLayout({
  service,
  panel,
  document,
  onClose,
  onActivate,
  tabLabel,
}: {
  service: LayoutService;
  panel: (id: PanelId) => ReactNode;
  document: (id: string) => ReactNode;
  onClose?: (id: string) => void;
  onActivate?: (id: string) => void;
  tabLabel?: (id: string) => ReactNode;
}) {
  useSyncExternalStore(service.subscribe, service.snapshot);
  const factory = (node: TabNode) =>
    node.getComponent() === 'document'
      ? document(node.getConfig().documentId)
      : panel(node.getConfig().panelId);
  return (
    <Layout
      model={service.model}
      factory={factory}
      supportsPopout
      popoutURL="/popout.html"
      icons={{
        close: <X size={12} />,
        maximize: <Maximize2 size={12} />,
        restore: <Minimize2 size={12} />,
        popout: <ExternalLink size={12} />,
        pin: <Pin size={12} />,
        more: <Ellipsis size={12} />,
        popoutFloat: <PanelsTopLeft size={12} />,
      }}
      onAction={(action) => {
        if (action.type === Actions.DELETE_TAB && String(action.data.node).startsWith('doc-')) {
          onClose?.(String(action.data.node).slice(4));
          return undefined;
        }
        if (action.type === Actions.SELECT_TAB && String(action.data.tabNode).startsWith('doc-'))
          onActivate?.(String(action.data.tabNode).slice(4));
        service.record();
        return action;
      }}
      onRenderTab={(node, values) => {
        if (node.getComponent() === 'document' && tabLabel)
          values.content = tabLabel(node.getConfig().documentId);
      }}
      onModelChange={service.changed}
    />
  );
}
