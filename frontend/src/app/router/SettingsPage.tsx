import { useSyncExternalStore } from 'react';
import { Link } from '@tanstack/react-router';
import { useApplication } from '../providers/ApplicationProvider';
export function SettingsPage() {
  const app = useApplication(),
    value = useSyncExternalStore(app.settings.subscribe, app.settings.snapshot);
  return (
    <div className="page">
      <p className="eyebrow">USER PREFERENCES</p>
      <h1>Settings</h1>
      <label>
        Theme{' '}
        <select
          value={value.theme}
          onChange={(e) =>
            app.settings.set({ ...value, theme: e.target.value as 'dark' | 'light' })
          }
        >
          <option>dark</option>
          <option>light</option>
        </select>
      </label>
      <label>
        Ribbon{' '}
        <select
          value={value.ribbonMode}
          onChange={(e) =>
            app.settings.set({ ...value, ribbonMode: e.target.value as typeof value.ribbonMode })
          }
        >
          <option>full</option>
          <option>slim</option>
          <option>hidden</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.restoreWorkspace}
          onChange={(e) => app.settings.set({ ...value, restoreWorkspace: e.target.checked })}
        />{' '}
        Restore workspace on launch
      </label>
      <Link
        to="/workspace/$workspaceId"
        params={{ workspaceId: app.workspace.state.snapshot().id }}
      >
        Back to workspace
      </Link>
    </div>
  );
}
