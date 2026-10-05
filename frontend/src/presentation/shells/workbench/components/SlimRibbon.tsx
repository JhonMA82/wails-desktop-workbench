import { useState, useSyncExternalStore } from 'react';
import type { CommandRegistry } from '../../../../workbench/commands/command-registry';
import { CommandButton } from '../../../design-system/components/CommandButton';
import { ApplicationMenu } from '../../../design-system/components/ApplicationMenu';
export type RibbonMode = 'full' | 'slim' | 'hidden';
export function SlimRibbon({ registry, mode }: { registry: CommandRegistry; mode: RibbonMode }) {
  const [category, setCategory] = useState<'Home' | 'View' | 'Tools'>('Home');
  useSyncExternalStore(registry.context.subscribe, registry.context.snapshot);
  if (mode === 'hidden') return null;
  return (
    <section className={'ribbon-wrap ' + mode} aria-label="Ribbon">
      <div className="ribbon">
        <ApplicationMenu registry={registry} />
        <div role="tablist" aria-label="Ribbon category">
          {(['Home', 'View', 'Tools'] as const).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="appbar-end">
          <CommandButton registry={registry} id="ribbon.cycle" iconOnly />
          <CommandButton registry={registry} id="command.palette" iconOnly />
        </span>
      </div>
      {mode === 'full' && (
        <div className="ribbon-tools">
          {registry
            .list()
            .filter((c) => c.category === category)
            .map((c) => (
              <CommandButton key={c.id} registry={registry} id={c.id} />
            ))}
        </div>
      )}
    </section>
  );
}
