import { MinimalLayout } from './layout';
export { MinimalShell as AppShell } from './shell';
export const createLayout = () => new MinimalLayout();
export const presentation = { shell: 'minimal' } as const;
