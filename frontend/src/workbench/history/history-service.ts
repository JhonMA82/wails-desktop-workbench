import { ObservableValue } from '../../shared/utils/observable-value';
export interface Operation {
  do(): void;
  undo(): void;
}
export class HistoryService {
  private done: Operation[] = [];
  private undone: Operation[] = [];
  readonly state = new ObservableValue({ canUndo: false, canRedo: false });
  do(operation: Operation) {
    operation.do();
    this.done.push(operation);
    this.undone = [];
    this.publish();
  }
  undo() {
    const op = this.done.pop();
    if (op) {
      op.undo();
      this.undone.push(op);
      this.publish();
    }
  }
  redo() {
    const op = this.undone.pop();
    if (op) {
      op.do();
      this.done.push(op);
      this.publish();
    }
  }
  private publish() {
    this.state.set({ canUndo: this.done.length > 0, canRedo: this.undone.length > 0 });
  }
}
