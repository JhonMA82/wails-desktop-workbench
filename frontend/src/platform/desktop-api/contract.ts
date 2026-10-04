import type {
  Diagnostic,
  Job,
  Session,
  UserSettings,
  WorkspaceRecord,
} from '../../shared/schemas/records';
export interface DesktopApi {
  readonly kind: 'desktop' | 'web-preview';
  loadSession(): Promise<Session>;
  saveWorkspace(workspace: WorkspaceRecord): Promise<void>;
  saveSettings(settings: UserSettings): Promise<void>;
  startJob(fail: boolean): Promise<Job>;
  cancelJob(id: string): Promise<void>;
  jobs(): Promise<Job[]>;
  diagnostics(): Promise<Diagnostic[]>;
  recordDiagnostic(level: Diagnostic['level'], message: string): Promise<void>;
  runtimeInfo(): Promise<{
    version: string;
    capabilities: { name: string; cancellable: boolean }[];
  }>;
  onClosing(fn: () => void): () => void;
  onCommand(fn: (id: string) => void): () => void;
  windowAction(action: 'minimize' | 'maximize' | 'close'): Promise<void>;
}
