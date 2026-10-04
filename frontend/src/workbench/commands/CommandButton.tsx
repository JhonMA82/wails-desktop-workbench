import { useSyncExternalStore } from 'react';
import {
  FolderOpen,
  Save,
  FolderTree,
  SlidersHorizontal,
  Terminal,
  RotateCcw,
  Play,
  Square,
  Undo2,
  Redo2,
  Search,
  Settings,
  Focus,
  Shield,
  Activity,
  X,
  PanelTop,
  MousePointer2,
} from 'lucide-react';
import { Button } from '../../shared/ui/button';
import { type CommandRegistry, type IconName } from './command-registry';
const icons = {
  open: FolderOpen,
  save: Save,
  explorer: FolderTree,
  inspector: SlidersHorizontal,
  console: Terminal,
  reset: RotateCcw,
  play: Play,
  cancel: Square,
  undo: Undo2,
  redo: Redo2,
  palette: Search,
  settings: Settings,
  focus: Focus,
  trust: Shield,
  diagnostics: Activity,
  close: X,
  ribbon: PanelTop,
  select: MousePointer2,
};
export function CommandIcon({ name, size = 15 }: { name?: IconName; size?: number }) {
  const Icon = name ? icons[name] : undefined;
  return Icon ? <Icon size={size} /> : null;
}
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
