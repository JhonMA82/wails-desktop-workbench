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
import type { IconName } from '../../../workbench/commands/command-registry';
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
