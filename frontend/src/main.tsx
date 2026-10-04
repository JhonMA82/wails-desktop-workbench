import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { createDesktopApi } from './platform/desktop-api/desktop';
import { createApplication } from './app/bootstrap/application';
import { ApplicationProvider } from './app/providers/ApplicationProvider';
import { router } from './app/router/router';
import { installKeybindings } from './workbench/keybindings/keybindings';
import './styles.css';
async function bootstrap() {
  const app = await createApplication(await createDesktopApi());
  installKeybindings(app.commands);
  app.settings.subscribe(
    () => (document.documentElement.dataset.theme = app.settings.snapshot().theme),
  );
  document.documentElement.dataset.theme = app.settings.snapshot().theme;
  window.addEventListener('error', (e) => app.diagnostics.report(e.error ?? e.message));
  window.addEventListener('unhandledrejection', (e) => app.diagnostics.report(e.reason));
  window.addEventListener('pagehide', () => {
    void app.persistence.flush();
  });
  if (location.pathname === '/') {
    await router.navigate({
      to: '/workspace/$workspaceId',
      params: { workspaceId: app.workspace.state.snapshot().id },
      search: () => (new URLSearchParams(location.search).has('preview') ? { preview: '1' } : {}),
    });
  }
  createRoot(document.getElementById('root')!).render(
    <ApplicationProvider application={app}>
      <RouterProvider router={router} />
    </ApplicationProvider>,
  );
}
void bootstrap().catch((error) => {
  document.getElementById('root')!.textContent = 'Startup failed: ' + String(error);
});
