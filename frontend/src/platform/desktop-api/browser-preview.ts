import type { DesktopApi } from './contract';
import {
  defaultSettings,
  settingsSchema,
  workspaceSchema,
  type Diagnostic,
  type Job,
  type Session,
  type WorkspaceRecord,
  type UserSettings,
} from '../../shared/schemas/records';
// Explicit browser fixture: desktop production never falls back to this adapter.
export class BrowserPreviewApi implements DesktopApi {
  readonly kind = 'web-preview' as const;
  private entries: Diagnostic[] = [];
  private records: Job[] = [];
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  async loadSession(): Promise<Session> {
    const raw = localStorage.getItem('workbench.settings');
    const settings = raw ? settingsSchema.parse(JSON.parse(raw)) : defaultSettings;
    const recovery = localStorage.getItem('workbench.recovery');
    let workspace: WorkspaceRecord | null = null;
    if (settings.restoreWorkspace && recovery) {
      const { workspaceId } = JSON.parse(recovery);
      const record = localStorage.getItem('workbench.workspace.' + workspaceId);
      if (record) workspace = workspaceSchema.parse(JSON.parse(record));
    }
    return { settings, workspace, diagnostics: this.entries };
  }
  async saveWorkspace(value: WorkspaceRecord) {
    const v = workspaceSchema.parse(value);
    localStorage.setItem('workbench.workspace.' + v.id, JSON.stringify(v));
    localStorage.setItem(
      'workbench.recovery',
      JSON.stringify({ schemaVersion: 1, workspaceId: v.id }),
    );
  }
  async saveSettings(value: UserSettings) {
    localStorage.setItem('workbench.settings', JSON.stringify(settingsSchema.parse(value)));
  }
  async startJob(fail: boolean) {
    const session = await this.loadSession();
    if (session.workspace?.trust !== 'trusted') throw new Error('Workspace is untrusted');
    const job: Job = {
      id: 'preview-' + (this.records.length + 1),
      type: 'demo.execute',
      status: 'queued',
      progress: 0,
      message: 'Queued',
      startedAt: new Date().toISOString(),
      error: '',
    };
    this.records.push(job);
    const timer = setInterval(() => {
      job.status = 'running';
      job.progress += 5;
      job.message = 'Processing demo operation';
      if (fail && job.progress >= 40) {
        job.status = 'failed';
        job.error = 'Intentional demo failure';
        job.message = 'Failed';
      } else if (job.progress >= 100) {
        job.status = 'completed';
        job.message = 'Demo operation completed';
        job.result = { message: job.message };
      }
      if (job.status === 'failed' || job.status === 'completed') {
        clearInterval(timer);
        this.timers.delete(job.id);
      }
    }, 150);
    this.timers.set(job.id, timer);
    return { ...job };
  }
  async cancelJob(id: string) {
    const timer = this.timers.get(id);
    if (timer) clearInterval(timer);
    this.timers.delete(id);
    const job = this.records.find((j) => j.id === id);
    if (job && !['completed', 'failed'].includes(job.status)) {
      job.status = 'cancelled';
      job.message = 'Cancelled';
    }
  }
  async jobs() {
    return this.records.map((j) => ({ ...j }));
  }
  async diagnostics() {
    return [...this.entries];
  }
  async recordDiagnostic(level: Diagnostic['level'], message: string) {
    this.entries.push({ level, message, at: new Date().toISOString() });
  }
  async runtimeInfo() {
    return {
      version: 'browser-fixture/1',
      capabilities: [{ name: 'demo.execute', cancellable: true }],
    };
  }
  onClosing() {
    return () => {};
  }
  onCommand() {
    return () => {};
  }
  async windowAction(action: 'minimize' | 'maximize' | 'close') {
    if (action === 'maximize') await document.documentElement.requestFullscreen?.();
  }
}
