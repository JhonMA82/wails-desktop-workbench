import type { CommandRegistry } from '../commands/command-registry';
export function matches(event: KeyboardEvent, binding: string) {
  const parts = binding.toLowerCase().split('+');
  const mod = parts.includes('mod');
  return (
    event.key.toLowerCase() === parts.at(-1) &&
    Boolean(event.ctrlKey || event.metaKey) === mod &&
    event.shiftKey === parts.includes('shift') &&
    event.altKey === parts.includes('alt')
  );
}
export function installKeybindings(registry: CommandRegistry, target: Window = window) {
  const handler = (event: KeyboardEvent) => {
    if (event.isComposing || event.repeat) return;
    const editable = (event.target as HTMLElement)?.closest(
      'input,textarea,[contenteditable=true]',
    );
    const command = registry.list().find((c) => c.keybinding && matches(event, c.keybinding));
    if (!command || !registry.enabled(command)) return;
    if (editable && !['command.palette', 'document.save'].includes(command.id)) return;
    event.preventDefault();
    void registry.execute(command.id);
  };
  target.addEventListener('keydown', handler);
  return () => target.removeEventListener('keydown', handler);
}
