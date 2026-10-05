import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { createDesktopApi } from './platform/desktop-api/desktop';
import { createApplication } from './app/bootstrap/application';
import { ApplicationProvider } from './app/providers/ApplicationProvider';
import { router } from './app/router/router';
import { installKeybindings } from './workbench/keybindings/keybindings';
import './presentation/styles.css';
import { createLayout, presentation } from './presentation/active';
import { applyPresentationPreferences } from './presentation/preferences';
async function bootstrap() {
  const app = await createApplication(await createDesktopApi(), createLayout());
  installKeybindings(app.commands);
  const applyPreferences = () =>
    applyPresentationPreferences(app.settings.snapshot(), presentation);
  app.settings.subscribe(applyPreferences);
  applyPreferences();
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
