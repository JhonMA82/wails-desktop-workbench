import { useSyncExternalStore } from 'react';
import { Command } from 'cmdk';
import type { CommandRegistry } from '../../../workbench/commands/command-registry';
import { CommandIcon } from './CommandButton';
export function CommandPalette({
  registry,
  open,
  onOpenChange,
}: {
  registry: CommandRegistry;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  useSyncExternalStore(registry.context.subscribe, registry.context.snapshot);
  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command Palette">
      <Command.Input placeholder="Type a command…" aria-label="Search commands" />
      <Command.List>
        <Command.Empty>No matching commands.</Command.Empty>
        {registry.list().map((c) => (
          <Command.Item
            key={c.id}
            value={c.title}
            disabled={!registry.enabled(c)}
            onSelect={() => {
              onOpenChange(false);
              void registry.execute(c.id);
            }}
          >
            <CommandIcon name={c.icon} />
            <span>{c.title}</span>
            <kbd>{c.keybinding}</kbd>
          </Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
