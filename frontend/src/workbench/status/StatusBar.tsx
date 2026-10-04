import { useSyncExternalStore } from 'react';
import { useApplication } from '../../app/providers/ApplicationProvider';
export function StatusBar() {
  const app = useApplication(),
    jobs = useSyncExternalStore(app.jobs.state.subscribe, app.jobs.state.snapshot),
    workspace = useSyncExternalStore(app.workspace.state.subscribe, app.workspace.state.snapshot);
  const latest = jobs.at(-1),
    running = jobs.find((j) => j.status === 'running' || j.status === 'queued');
  return (
    <footer className="statusbar">
      <span>● {running ? 'Processing' : 'Ready'}</span>
      <span>{workspace.trust === 'trusted' ? 'Trusted' : 'Restricted'}</span>
      {latest && (
        <span data-testid="job-status">
          {latest.status} · {latest.progress}%
        </span>
      )}
      <span className="appbar-end">
        {app.api.kind === 'desktop' ? 'Go / Wails' : 'Web preview'}　 ·　 UTF-8
      </span>
    </footer>
  );
}
