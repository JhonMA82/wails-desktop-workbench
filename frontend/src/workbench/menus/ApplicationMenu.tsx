import * as Menu from '@radix-ui/react-dropdown-menu';
import { useSyncExternalStore } from 'react';
import type { CommandRegistry } from '../commands/command-registry';
export function ApplicationMenu({ registry }: { registry: CommandRegistry }) {
  useSyncExternalStore(registry.context.subscribe, registry.context.snapshot);
  return (
    <nav className="application-menu" aria-label="Application menu">
      {(['File', 'Edit', 'View'] as const).map((title) => (
        <Menu.Root key={title}>
          <Menu.Trigger asChild>
            <button>{title}</button>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content className="menu-surface" sideOffset={4}>
              {registry
                .list()
                .filter((c) => c.category === (title === 'File' ? 'Home' : title))
                .map((c) => (
                  <Menu.Item
                    className="menu-item"
                    key={c.id}
                    disabled={!registry.enabled(c)}
                    onSelect={() => void registry.execute(c.id)}
                  >
                    {c.title}
                    <kbd>{c.keybinding}</kbd>
                  </Menu.Item>
                ))}
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
      ))}
    </nav>
  );
}
