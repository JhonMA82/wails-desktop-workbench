// Subscription primitive only. Each service owns its own value and transitions.
export class ObservableValue<T> {
  private listeners = new Set<() => void>();
  constructor(private value: T) {}
  snapshot = () => this.value;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  set(value: T) {
    if (Object.is(value, this.value)) return;
    this.value = value;
    this.listeners.forEach((fn) => fn());
  }
}
