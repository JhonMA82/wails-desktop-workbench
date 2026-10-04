import { ObservableValue } from '../../shared/utils/observable-value';
export class NotificationService {
  readonly state = new ObservableValue<{ id: number; message: string } | null>(null);
  private id = 0;
  show(message: string) {
    this.state.set({ id: ++this.id, message });
  }
  clear() {
    this.state.set(null);
  }
}
