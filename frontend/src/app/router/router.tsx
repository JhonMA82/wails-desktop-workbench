import { createRootRoute, createRoute, createRouter, Outlet, Link } from '@tanstack/react-router';
import { Shell } from '../../workbench/shell/Shell';
import { SettingsPage } from './SettingsPage';
const root = createRootRoute({ component: () => <Outlet /> });
const home = createRoute({ getParentRoute: () => root, path: '/', component: Landing });
const projects = createRoute({ getParentRoute: () => root, path: '/projects', component: Landing });
const workspace = createRoute({
  getParentRoute: () => root,
  path: '/workspace/$workspaceId',
  component: Shell,
});
const settings = createRoute({
  getParentRoute: () => root,
  path: '/settings',
  component: SettingsPage,
});
const about = createRoute({
  getParentRoute: () => root,
  path: '/about',
  component: () => (
    <div className="page">
      <h1>Desktop Workbench</h1>
      <p>React / Workbench → Wails / Go → optional runtime</p>
      <Link to="/workspace/$workspaceId" params={{ workspaceId: 'demo' }}>
        Back to workspace
      </Link>
    </div>
  ),
});
function Landing() {
  return (
    <div className="page">
      <h1>Workspaces</h1>
      <Link to="/workspace/$workspaceId" params={{ workspaceId: 'demo' }}>
        Open demo workspace
      </Link>
      <p>
        <Link to="/settings">Settings</Link> · <Link to="/about">About</Link>
      </p>
    </div>
  );
}
export const router = createRouter({
  routeTree: root.addChildren([home, projects, workspace, settings, about]),
});
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
