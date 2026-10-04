import type { DesktopApi } from '../../platform/desktop-api/contract';
import { ObservableValue } from '../../shared/utils/observable-value';
import type { Job } from '../../shared/schemas/records';
export class JobService {
  readonly state = new ObservableValue<Job[]>([]);
  private timer?: ReturnType<typeof setInterval>;
  private inFlight = false;
  constructor(
    private api: DesktopApi,
    private report: (e: unknown) => void,
  ) {}
  startPolling() {
    this.timer = setInterval(() => void this.refresh(), 150);
    return () => {
      clearInterval(this.timer);
    };
  }
  async refresh() {
    if (this.inFlight) return;
    this.inFlight = true;
    try {
      this.state.set(await this.api.jobs());
    } catch (e) {
      this.report(e);
    } finally {
      this.inFlight = false;
    }
  }
  async start(fail = false) {
    await this.api.startJob(fail);
    await this.refresh();
  }
  async cancel() {
    const jobs = this.state
      .snapshot()
      .filter((j) => j.status === 'running' || j.status === 'queued');
    await Promise.all(jobs.map((j) => this.api.cancelJob(j.id)));
    await this.refresh();
  }
}
