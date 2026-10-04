import { createContext, useContext, type ReactNode } from 'react';
import type { WorkbenchApplication } from '../bootstrap/application';
const ApplicationContext = createContext<WorkbenchApplication | null>(null);
export function ApplicationProvider({
  application,
  children,
}: {
  application: WorkbenchApplication;
  children: ReactNode;
}) {
  return <ApplicationContext.Provider value={application}>{children}</ApplicationContext.Provider>;
}
export function useApplication() {
  const app = useContext(ApplicationContext);
  if (!app) throw new Error('Missing ApplicationProvider');
  return app;
}
