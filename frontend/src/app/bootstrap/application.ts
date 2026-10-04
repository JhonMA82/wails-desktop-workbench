import type { DesktopApi } from '../../platform/desktop-api/contract';
import { ObservableValue } from '../../shared/utils/observable-value';
import type { UserSettings } from '../../shared/schemas/records';
import { ContextKeyService } from '../../workbench/context/context-keys';
import { CommandRegistry } from '../../workbench/commands/command-registry';
import { DocumentService } from '../../workbench/documents/document-service';
import { LayoutService } from '../../workbench/layout/layout-service';
import { WorkspaceService } from '../../workbench/workspace/workspace-service';
import { HistoryService } from '../../workbench/history/history-service';
import { JobService } from '../../workbench/jobs/job-service';
import { DialogService } from '../../workbench/dialogs/dialog-service';
import { NotificationService } from '../../workbench/notifications/notification-service';
import { DiagnosticsService } from './diagnostics';
import { SessionPersistence } from './persistence';
import { registerCommands } from './register-commands';
export async function createApplication(api: DesktopApi) {
  const session = await api.loadSession();
  const diagnostics = new DiagnosticsService(api);
  diagnostics.state.set(session.diagnostics);
  const settings = new ObservableValue<UserSettings>(session.settings),
    documents = new DocumentService(),
    layout = new LayoutService(),
    workspace = new WorkspaceService(documents, layout),
    context = new ContextKeyService(),
    dialogs = new DialogService(),
    notifications = new NotificationService();
  if (session.workspace) workspace.restore(session.workspace);
  const histories = new Map<string, HistoryService>();
  const history = () => {
    const id = documents.state.snapshot().active;
    let value = histories.get(id);
    if (!value) {
      value = new HistoryService();
      histories.set(id, value);
      value.state.subscribe(syncContext);
    }
    return value;
  };
  const jobs = new JobService(api, diagnostics.report),
    commands = new CommandRegistry(context, diagnostics.report),
    persistence = new SessionPersistence(api, workspace, settings, diagnostics.report);
  const ui = new ObservableValue({ zen: false });
  function syncContext() {
    const doc = documents.active(),
      state = workspace.state.snapshot();
    const hist = histories.get(doc?.id ?? '')?.state.snapshot();
    context.update({
      'workspace.open': state.open,
      'workspace.trusted': state.trust === 'trusted',
      'document.open': !!doc,
      'document.dirty': doc?.dirty ?? false,
      'selection.count': doc?.value ?? 0,
      'job.running': jobs.state
        .snapshot()
        .some((j) => j.status === 'running' || j.status === 'queued'),
      'panel.explorer.visible': layout.visible('explorer'),
      'panel.inspector.visible': layout.visible('inspector'),
      'history.undo': hist?.canUndo ?? false,
      'history.redo': hist?.canRedo ?? false,
    });
  }
  const app = {
    api,
    settings,
    documents,
    layout,
    workspace,
    context,
    dialogs,
    notifications,
    diagnostics,
    history,
    jobs,
    commands,
    persistence,
    ui,
  };
  registerCommands(app);
  syncContext();
  const disposers = [
    documents.state.subscribe(() => {
      const d = documents.state.snapshot();
      layout.syncDocuments(d.open, d.active);
      syncContext();
      void persistence.save();
    }),
    workspace.state.subscribe(() => {
      syncContext();
      void persistence.save();
    }),
    layout.subscribe(() => {
      syncContext();
      void persistence.save();
    }),
    settings.subscribe(() => {
      void persistence.save();
    }),
    jobs.state.subscribe(syncContext),
    api.onCommand((id) => void commands.execute(id)),
  ];
  await persistence.save();
  disposers.push(
    jobs.startPolling(),
    api.onClosing(() => {
      void persistence
        .flush()
        .then(() => api.windowAction('close'))
        .catch(diagnostics.report);
    }),
  );
  return { ...app, dispose: () => disposers.forEach((fn) => fn()) };
}
export type WorkbenchApplication = Awaited<ReturnType<typeof createApplication>>;
export type ApplicationServices = Omit<WorkbenchApplication, 'dispose'>;
