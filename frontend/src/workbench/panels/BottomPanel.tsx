import { useSyncExternalStore } from 'react';
import { useApplication } from '../../app/providers/ApplicationProvider';
import type { PanelId } from '../layout/layout-service';
import { panelTitles } from '../layout/layout-service';
import { WorkbenchPanel, EmptyState } from './WorkbenchPanel';
import { CommandButton } from '../commands/CommandButton';
import { JobProgress } from '../jobs/JobProgress';
export function BottomPanel({ id }: { id: PanelId }) {
  const app = useApplication(),
    jobs = useSyncExternalStore(app.jobs.state.subscribe, app.jobs.state.snapshot),
    entries = useSyncExternalStore(app.diagnostics.state.subscribe, app.diagnostics.state.snapshot);
  return (
    <WorkbenchPanel
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
            {app.api.kind === 'desktop'
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
    </WorkbenchPanel>
  );
}
