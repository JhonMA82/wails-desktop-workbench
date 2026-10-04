import { describe, it, expect, vi } from 'vitest';
import { ContextKeyService } from '../context/context-keys';
import { CommandRegistry } from './command-registry';
import { matches } from '../keybindings/keybindings';
describe('Command registry / context', () => {
  it('gates every execution at the same registry boundary', async () => {
    const context = new ContextKeyService(),
      r = new CommandRegistry(context),
      execute = vi.fn();
    r.register({
      id: 'save',
      title: 'Save',
      category: 'Home',
      execute,
      enabled: (c) => !!c['document.dirty'],
    });
    expect(await r.execute('save')).toBe(false);
    context.set('document.dirty', true);
    expect(await r.execute('save')).toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(() => r.register(r.get('save')!)).toThrow('Duplicate');
  });
  it('updates visibility and reports failures', async () => {
    const c = new ContextKeyService(),
      report = vi.fn(),
      r = new CommandRegistry(c, report);
    r.register({
      id: 'fail',
      title: 'Fail',
      category: 'Tools',
      when: (s) => !!s['workspace.open'],
      execute: () => {
        throw new Error('engine failure');
      },
    });
    expect(r.list()).toHaveLength(0);
    c.set('workspace.open', true);
    expect(r.list()).toHaveLength(1);
    await r.execute('fail');
    expect(report).toHaveBeenCalledOnce();
  });
  it('does not notify unchanged context and matches exact shortcuts', () => {
    const c = new ContextKeyService(),
      fn = vi.fn();
    c.subscribe(fn);
    c.set('editor.focused', true);
    c.set('editor.focused', true);
    expect(fn).toHaveBeenCalledOnce();
    expect(
      matches(
        new KeyboardEvent('keydown', { key: 'P', ctrlKey: true, shiftKey: true }),
        'Mod+Shift+P',
      ),
    ).toBe(true);
    expect(matches(new KeyboardEvent('keydown', { key: 'p', ctrlKey: true }), 'Mod+Shift+P')).toBe(
      false,
    );
  });
});
