import type { CreatePresentationLayout, PresentationSelection } from '../../contract/shell';
import { LayoutService } from './layout/layout-service';
export { WorkbenchShell as AppShell } from './shell';
export const createLayout: CreatePresentationLayout = () => new LayoutService();
export const presentation: PresentationSelection = { shell: 'workbench' };
