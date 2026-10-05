import { useSyncExternalStore } from 'react';
import { Button } from './button';
import { type CommandRegistry } from '../../../workbench/commands/command-registry';
import { CommandIcon } from '../icons/CommandIcon';
export { CommandIcon } from '../icons/CommandIcon';
export function CommandButton({
  registry,
  id,
  iconOnly = false,
}: {
  registry: CommandRegistry;
  id: string;
  iconOnly?: boolean;
}) {
  useSyncExternalStore(registry.context.subscribe, registry.context.snapshot);
  const c = registry.get(id);
  if (!c || !registry.visible(c)) return null;
  return (
    <Button
      className="command-button"
      title={c.title + (c.keybinding ? ' (' + c.keybinding + ')' : '')}
      aria-label={c.title}
      disabled={!registry.enabled(c)}
      onClick={() => void registry.execute(id)}
    >
      <CommandIcon name={c.icon} />
      {!iconOnly && c.title}
    </Button>
  );
}
