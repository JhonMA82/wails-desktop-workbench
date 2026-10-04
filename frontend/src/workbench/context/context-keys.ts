export type ContextValue = string | number | boolean | undefined;
export type ContextSnapshot = Readonly<Record<string, ContextValue>>;
export type Condition = (context: ContextSnapshot) => boolean;
export class ContextKeyService {
  private state: ContextSnapshot = {};
  private listeners = new Set<() => void>();
  snapshot = () => this.state;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  set(key: string, value: ContextValue) {
    this.update({ [key]: value });
  }
  update(values: Record<string, ContextValue>) {
    if (Object.entries(values).every(([k, v]) => this.state[k] === v)) return;
    this.state = { ...this.state, ...values };
    this.listeners.forEach((fn) => fn());
  }
}
