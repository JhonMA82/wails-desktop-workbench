import { useSyncExternalStore } from 'react';
import { Box } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useApplication } from '../../app/providers/ApplicationProvider';
import { CommandButton } from '../commands/CommandButton';
export function AppBar() {
  const app = useApplication(),
    workspace = useSyncExternalStore(app.workspace.state.subscribe, app.workspace.state.snapshot);
  return (
    <header className="appbar">
      <Box size={17} />
      <strong>WORKBENCH</strong>
      <span className="muted">/ {workspace.title}</span>
      <span className="appbar-end">
        <Link to="/projects">Projects</Link>
        <CommandButton registry={app.commands} id="view.zen" iconOnly />
      </span>
    </header>
  );
}
