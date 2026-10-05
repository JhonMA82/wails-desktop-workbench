import { useApplication } from '../../app/providers/ApplicationProvider';
import type { ApplicationServices } from '../../app/bootstrap/application';
// Import policy and a narrowed view of existing services; no second Application API.
export type PresentationServices = Pick<
  ApplicationServices,
  | 'commands'
  | 'context'
  | 'documents'
  | 'workspace'
  | 'jobs'
  | 'settings'
  | 'notifications'
  | 'dialogs'
  | 'diagnostics'
  | 'layout'
  | 'ui'
>;
export function usePresentation(): PresentationServices {
  return useApplication();
}
export { Link } from '@tanstack/react-router';
