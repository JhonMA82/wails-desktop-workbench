import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { ApplicationProvider } from '../app/providers/ApplicationProvider';
import { createApplication, type WorkbenchApplication } from '../app/bootstrap/application';
import { BrowserPreviewApi } from '../platform/desktop-api/browser-preview';
import { WorkbenchShell } from './shells/workbench/shell';
import { LayoutService } from './shells/workbench/layout/layout-service';
import { MinimalShell } from './shells/minimal/shell';
import { MinimalLayout } from './shells/minimal/layout';
import { applyPresentationPreferences } from './preferences';
import { defaultSettings, settingsSchema } from '../shared/schemas/records';
import { loadDensity, saveDensity } from '../platform/desktop-api/presentation-preferences';
vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
  width: 1440,
  height: 900,
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 1440,
  bottom: 900,
  toJSON() {
    return {};
  },
});
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
let app: WorkbenchApplication | undefined;
afterEach(async () => {
  cleanup();
  if (app) {
    await app.jobs.cancel();
    app.dispose();
    app = undefined;
  }
  localStorage.clear();
});
describe.each([
  { name: 'Workbench', Shell: WorkbenchShell, layout: () => new LayoutService() },
  { name: 'Minimal', Shell: MinimalShell, layout: () => new MinimalLayout() },
])('$name presentation', ({ Shell, layout }) => {
  it('renders and consumes the same document command and job snapshots', async () => {
    app = await createApplication(new BrowserPreviewApi(), layout());
    const route = createRootRoute({ component: Shell });
    const router = createRouter({
      routeTree: route,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    await router.load();
    render(
      <ApplicationProvider application={app}>
        <RouterProvider router={router} />
      </ApplicationProvider>,
    );
    await screen.findByText(/Your next technical/);
    const execute = vi.spyOn(app.commands, 'execute');
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Open Demo Document' })[0]);
    });
    expect(execute).toHaveBeenCalledWith('document.open');
    expect(app.documents.state.snapshot().open).toHaveLength(2);
    await act(async () => {
      await app!.commands.execute('document.demo.increment');
    });
    expect(app.documents.active()?.value).toBe(1);
    await act(async () => {
      app!.jobs.state.set([
        {
          id: 'shared-job',
          type: 'demo.execute',
          status: 'running',
          progress: 42,
          message: 'Working',
          startedAt: '2026-10-04',
          error: '',
        },
      ]);
      app!.layout.show('jobs');
    });
    expect(screen.getByTestId('job-status')).toHaveTextContent('running · 42%');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '42');
  });
  it('restores settings and documents using the existing persistence service', async () => {
    app = await createApplication(new BrowserPreviewApi(), layout());
    await app.commands.execute('document.open');
    await app.commands.execute('view.explorer.toggle');
    app.settings.set({ ...app.settings.snapshot(), theme: 'light', density: 'comfortable' });
    await app.persistence.flush();
    const active = app.documents.state.snapshot().active;
    app.dispose();
    app = await createApplication(new BrowserPreviewApi(), layout());
    expect(app.documents.state.snapshot().active).toBe(active);
    expect(app.layout.visible('explorer')).toBe(false);
    expect(app.settings.snapshot()).toMatchObject({ theme: 'light', density: 'comfortable' });
  });
});
it('theme, density and product shell are independent selections; legacy settings default density', () => {
  for (const shell of ['workbench', 'minimal'] as const)
    for (const theme of ['dark', 'light'] as const)
      for (const density of ['compact', 'comfortable'] as const) {
        applyPresentationPreferences({ ...defaultSettings, theme, density }, { shell });
        expect(document.documentElement.dataset).toMatchObject({
          shell,
          theme: theme === 'dark' ? 'graphite' : 'light',
          density,
        });
      }
  const legacy = { schemaVersion: 1, theme: 'dark', ribbonMode: 'full', restoreWorkspace: true };
  expect(settingsSchema.parse(legacy).density).toBe('compact');
  expect(loadDensity()).toBe('compact');
  saveDensity('comfortable');
  expect(loadDensity()).toBe('comfortable');
  localStorage.setItem('workbench.presentation.user', 'invalid');
  expect(loadDensity()).toBe('compact');
});
it('switching static products retains each shell layout without coupling documents to docking', () => {
  const workbench = new LayoutService();
  workbench.hide('inspector');
  const minimal = new MinimalLayout();
  minimal.restore(workbench.save());
  minimal.hide('explorer');
  workbench.restore(minimal.save());
  expect(workbench.visible('inspector')).toBe(false);
  minimal.restore(workbench.save());
  expect(minimal.visible('explorer')).toBe(false);
});

it('Minimal hides unsupported presentation actions through the same registry context', async () => {
  app = await createApplication(new BrowserPreviewApi(), new MinimalLayout());
  expect(app.commands.list().map((c) => c.id)).not.toContain('view.console.toggle');
  expect(await app.commands.execute('view.console.toggle')).toBe(false);
  expect(app.commands.list().map((c) => c.id)).not.toContain('view.explorer.float');
  expect(await app.commands.execute('view.explorer.toggle')).toBe(true);
});
