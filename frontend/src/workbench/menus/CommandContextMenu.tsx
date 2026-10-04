import * as Menu from '@radix-ui/react-context-menu';
import { useSyncExternalStore, type ReactNode } from 'react';
import type { CommandRegistry } from '../commands/command-registry';
export function CommandContextMenu({
  registry,
  ids,
  children,
}: {
  registry: CommandRegistry;
  ids: string[];
  children: ReactNode;
}) {
  useSyncExternalStore(registry.context.subscribe, registry.context.snapshot);
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <div className="context-target">{children}</div>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className="menu-surface">
          {ids.map((id) => {
            const c = registry.get(id);
            return c && registry.visible(c) ? (
              <Menu.Item
                className="menu-item"
                key={id}
                disabled={!registry.enabled(c)}
                onSelect={() => void registry.execute(id)}
              >
                {c.title}
              </Menu.Item>
            ) : null;
          })}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
