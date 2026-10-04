import type { DesktopApi } from '../../platform/desktop-api/contract';
import { ObservableValue } from '../../shared/utils/observable-value';
import type { Diagnostic } from '../../shared/schemas/records';
export class DiagnosticsService {
  readonly state = new ObservableValue<Diagnostic[]>([]);
  constructor(private api: DesktopApi) {}
  report = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    this.state.set(
      [
        ...this.state.snapshot(),
        { level: 'error' as const, message, at: new Date().toISOString() },
      ].slice(-100),
    );
    void this.api.recordDiagnostic('error', message).catch(() => {});
  };
  async refresh() {
    this.state.set(await this.api.diagnostics());
  }
}
