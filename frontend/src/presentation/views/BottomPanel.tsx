import { useSyncExternalStore } from 'react';
import { usePresentation } from '../contract/presentation';
import type { PanelId } from '../../workbench/layout/layout-contract';
import { panelTitles } from '../../workbench/layout/layout-contract';
import { Panel, EmptyState } from '../design-system/components/Panel';
import { CommandButton } from '../design-system/components/CommandButton';
import { JobProgress } from '../design-system/components/JobProgress';
export function BottomPanel({ id }: { id: PanelId }) {
  const app = usePresentation(),
    jobs = useSyncExternalStore(app.jobs.state.subscribe, app.jobs.state.snapshot),
    entries = useSyncExternalStore(app.diagnostics.state.subscribe, app.diagnostics.state.snapshot);
  return (
    <Panel
      title={panelTitles[id]}
      actions={
        id === 'jobs' ? (
          <>
            <CommandButton registry={app.commands} id="jobs.demo.start" iconOnly />
            <CommandButton registry={app.commands} id="jobs.demo.cancel" iconOnly />
          </>
        ) : undefined
      }
    >
      {id === 'jobs' ? (
        jobs.length ? (
          jobs.map((j) => <JobProgress key={j.id} job={j} />)
        ) : (
          <EmptyState title="No jobs" detail="Run a demo job from Tools or the Command Palette." />
        )
      ) : id === 'problems' ? (
        entries.length ? (
          <ul className="diagnostics-list">
            {entries.map((d, i) => (
              <li key={i}>
                <span>{d.level.toUpperCase()}</span> {d.message}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No problems detected" detail="Unexpected errors appear here." />
        )
      ) : (
        <div className="output-lines">
          <p>
            <span>08:00:00</span> Workbench application services ready
          </p>
          <p>
            <span>08:00:00</span>{' '}
            {app.context.snapshot()['host.kind'] === 'desktop'
              ? 'Go host / MockRuntime'
              : 'Explicit browser preview fixture'}
          </p>
          <p className="muted">
            {id === 'console'
              ? 'Demo console surface · no shell process attached'
              : 'Runtime operations report progress through the Job Service.'}
          </p>
        </div>
      )}
    </Panel>
  );
}
