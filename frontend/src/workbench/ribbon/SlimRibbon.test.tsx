import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { CommandRegistry } from '../commands/command-registry';
import { ContextKeyService } from '../context/context-keys';
import { SlimRibbon } from './SlimRibbon';
afterEach(cleanup);
it('Ribbon consumes the registered action and its context enablement', () => {
  const c = new ContextKeyService(),
    r = new CommandRegistry(c),
    execute = vi.fn();
  r.register({ id: 'save', title: 'Save', category: 'Home', execute, enabled: (s) => !!s.dirty });
  const view = render(<SlimRibbon registry={r} mode="full" />);
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  c.set('dirty', true);
  view.rerender(<SlimRibbon registry={r} mode="full" />);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(execute).toHaveBeenCalledOnce();
  view.rerender(<SlimRibbon registry={r} mode="slim" />);
  expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
});
