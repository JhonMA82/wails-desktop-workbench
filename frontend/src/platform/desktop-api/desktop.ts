import { z } from 'zod';
import { sessionSchema, jobSchema, diagnosticSchema } from '../../shared/schemas/records';
import type { DesktopApi } from './contract';
export async function createDesktopApi(): Promise<DesktopApi> {
  if (new URLSearchParams(location.search).has('preview')) {
    const { BrowserPreviewApi } = await import('./browser-preview');
    return new BrowserPreviewApi();
  }
  const host = await import('../../../bindings/workbench/internal/platform/host');
  const shell = await import('../../../bindings/workbench/internal/platform/desktopshell');
  const { Level } = await import('../../../bindings/workbench/internal/app/trust/models');
  const { Events, Window } = await import('@wailsio/runtime');
  return {
    kind: 'desktop',
    loadSession: async () => sessionSchema.parse(await host.LoadSession()),
    saveWorkspace: async (v) => {
      await host.SaveWorkspace({
        ...v,
        trust: v.trust === 'trusted' ? Level.Trusted : Level.Untrusted,
      });
    },
    saveSettings: async (v) => {
      await host.SaveSettings(v);
    },
    startJob: async (fail) => jobSchema.parse(await host.StartJob(fail)),
    cancelJob: async (id) => {
      await host.CancelJob(id);
    },
    jobs: async () => z.array(jobSchema).parse(await host.Jobs()),
    diagnostics: async () => z.array(diagnosticSchema).parse(await host.Diagnostics()),
    recordDiagnostic: async (l, m) => {
      await host.RecordDiagnostic(l, m);
    },
    runtimeInfo: async () =>
      z
        .object({
          version: z.string(),
          capabilities: z.array(z.object({ name: z.string(), cancellable: z.boolean() })),
        })
        .parse(await host.RuntimeInfo()),
    onClosing: (fn) => Events.On('workbench.closing', () => fn()),
    onCommand: (fn) =>
      Events.On('workbench.command', (event) =>
        fn(String(Array.isArray(event.data) ? event.data[0] : event.data)),
      ),
    windowAction: async (action) => {
      if (action === 'minimize') await Window.Minimise();
      else if (action === 'maximize') await Window.ToggleMaximise();
      else await shell.ConfirmClose();
    },
  };
}
