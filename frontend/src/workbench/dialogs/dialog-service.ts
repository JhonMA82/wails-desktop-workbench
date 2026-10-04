import { ObservableValue } from '../../shared/utils/observable-value';
export class DialogService {
  readonly state = new ObservableValue<{
    palette: boolean;
    quick: boolean;
    info: string | null;
    confirm: string | null;
  }>({ palette: false, quick: false, info: null, confirm: null });
  private resolve?: (result: boolean) => void;
  patch(value: Partial<ReturnType<typeof this.state.snapshot>>) {
    this.state.set({ ...this.state.snapshot(), ...value });
  }
  confirm(message: string) {
    if (this.resolve) return Promise.resolve(false);
    this.patch({ confirm: message });
    return new Promise<boolean>((resolve) => {
      this.resolve = resolve;
    });
  }
  answer(result: boolean) {
    this.resolve?.(result);
    this.resolve = undefined;
    this.patch({ confirm: null });
  }
}
