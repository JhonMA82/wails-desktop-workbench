import type { Condition, ContextKeyService } from '../context/context-keys';
export type IconName =
  | 'open'
  | 'save'
  | 'explorer'
  | 'inspector'
  | 'console'
  | 'reset'
  | 'play'
  | 'cancel'
  | 'undo'
  | 'redo'
  | 'palette'
  | 'settings'
  | 'focus'
  | 'trust'
  | 'diagnostics'
  | 'close'
  | 'ribbon'
  | 'select';
export interface Command {
  id: string;
  title: string;
  icon?: IconName;
  category: 'Home' | 'View' | 'Tools' | 'Edit';
  feature?: string;
  execute: () => void | Promise<void>;
  when?: Condition;
  enabled?: Condition;
  keybinding?: string;
}
export class CommandRegistry {
  private commands = new Map<string, Command>();
  constructor(
    readonly context: ContextKeyService,
    private report: (error: unknown) => void = () => {},
  ) {}
  register(command: Command) {
    if (this.commands.has(command.id)) throw new Error('Duplicate command: ' + command.id);
    this.commands.set(command.id, command);
    return () => this.commands.delete(command.id);
  }
  get(id: string) {
    return this.commands.get(id);
  }
  visible(command: Command) {
    return command.when?.(this.context.snapshot()) ?? true;
  }
  enabled(command: Command) {
    return this.visible(command) && (command.enabled?.(this.context.snapshot()) ?? true);
  }
  list() {
    return [...this.commands.values()].filter((c) => this.visible(c));
  }
  async execute(id: string) {
    const command = this.get(id);
    if (!command) throw new Error('Unknown command: ' + id);
    if (!this.enabled(command)) return false;
    try {
      await command.execute();
      return true;
    } catch (error) {
      this.report(error);
      return false;
    }
  }
}
