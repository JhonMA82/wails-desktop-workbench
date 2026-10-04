import type { ReactNode } from 'react';
export function PanelHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="panel-header">
      <span>{title}</span>
      {actions}
    </div>
  );
}
export function WorkbenchPanel({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="workbench-panel" aria-label={title}>
      <PanelHeader title={title} actions={actions} />
      <div className="panel-content">{children}</div>
    </section>
  );
}
export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}
