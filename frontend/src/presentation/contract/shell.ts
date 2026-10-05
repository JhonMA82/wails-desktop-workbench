import type { LayoutPort } from '../../workbench/layout/layout-contract';
export type ShellId = 'workbench' | 'minimal';
export interface PresentationSelection {
  readonly shell: ShellId;
}
export type CreatePresentationLayout = () => LayoutPort;
