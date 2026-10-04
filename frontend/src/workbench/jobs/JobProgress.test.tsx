import { it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { JobProgress } from './JobProgress';
afterEach(cleanup);
it('renders backend progress and failure', () => {
  const job = {
    id: 'job-1',
    type: 'demo.execute',
    status: 'running' as const,
    progress: 45,
    message: 'Working',
    startedAt: '2026-10-04',
    error: '',
  };
  const view = render(<JobProgress job={job} />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '45');
  view.rerender(<JobProgress job={{ ...job, status: 'failed', error: 'Engine failed' }} />);
  expect(screen.getByText('failed')).toBeVisible();
  expect(screen.getByText(/Engine failed/)).toBeVisible();
});
