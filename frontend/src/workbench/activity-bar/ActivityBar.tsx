import { useSyncExternalStore } from 'react';
import { Link } from '@tanstack/react-router';
import { Settings } from 'lucide-react';
import { useApplication } from '../../app/providers/ApplicationProvider';
import { CommandButton } from '../commands/CommandButton';
export function ActivityBar() {
  const app = useApplication();
  useSyncExternalStore(app.context.subscribe, app.context.snapshot);
  return (
    <aside className="activitybar" aria-label="Activity Bar">
      <div aria-pressed={Boolean(app.context.snapshot()['panel.explorer.visible'])}>
        <CommandButton registry={app.commands} id="view.explorer.toggle" iconOnly />
      </div>
      <div aria-pressed={Boolean(app.context.snapshot()['panel.inspector.visible'])}>
        <CommandButton registry={app.commands} id="view.inspector.toggle" iconOnly />
      </div>
      <CommandButton registry={app.commands} id="view.console.toggle" iconOnly />
      <CommandButton registry={app.commands} id="view.jobs.toggle" iconOnly />
      <Link to="/settings" aria-label="Settings">
        <Settings size={19} />
      </Link>
    </aside>
  );
}
