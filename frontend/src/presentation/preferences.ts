import type { UserSettings } from '../shared/schemas/records';
import type { PresentationSelection } from './contract/shell';
export function applyPresentationPreferences(
  settings: UserSettings,
  selection: PresentationSelection,
) {
  document.documentElement.dataset.shell = selection.shell;
  document.documentElement.dataset.theme = settings.theme === 'dark' ? 'graphite' : 'light';
  document.documentElement.dataset.density = settings.density;
}
