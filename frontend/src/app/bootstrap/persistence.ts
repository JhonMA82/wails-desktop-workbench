import type { DesktopApi } from '../../platform/desktop-api/contract';
import type { WorkspaceService } from '../../workbench/workspace/workspace-service';
import type { ObservableValue } from '../../shared/utils/observable-value';
import type { UserSettings } from '../../shared/schemas/records';
export class SessionPersistence {
  private queue: Promise<void> = Promise.resolve();
  constructor(
    private api: DesktopApi,
    private workspace: WorkspaceService,
    private settings: ObservableValue<UserSettings>,
    private report: (e: unknown) => void,
  ) {}
  save = () => {
    const workspace = this.workspace.serialize(),
      settings = this.settings.snapshot();
    this.queue = this.queue
      .catch(() => {})
      .then(async () => {
        await this.api.saveSettings(settings);
        await this.api.saveWorkspace(workspace);
      });
    void this.queue.catch(this.report);
    return this.queue;
  };
  flush = () => this.save();
}
