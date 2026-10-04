import type { ApplicationServices } from './application';
import { demoDocument } from '../../workbench/documents/document-service';
import { panelTitles, type PanelId } from '../../workbench/layout/layout-service';
export function registerCommands(app: ApplicationServices) {
  const {
    commands,
    context,
    documents,
    layout,
    workspace,
    settings,
    jobs,
    dialogs,
    notifications,
  } = app;
  const add = commands.register.bind(commands);
  let sequence =
    Math.max(
      0,
      ...documents.state
        .snapshot()
        .open.map((d) => Number(d.id.match(/^scratch-(\d+)$/)?.[1] ?? 0)),
    ) + 1;
  let zenLayout: unknown;
  add({
    id: 'workspace.open',
    title: 'Open Workspace',
    icon: 'open',
    category: 'Home',
    execute: () => workspace.open(),
    when: (c) => !c['workspace.open'],
  });
  add({
    id: 'workspace.close',
    title: 'Close Workspace',
    icon: 'close',
    category: 'Home',
    execute: async () => {
      await app.persistence.flush();
      workspace.close();
    },
    when: (c) => !!c['workspace.open'],
  });
  add({
    id: 'document.open',
    title: 'Open Demo Document',
    icon: 'open',
    category: 'Home',
    keybinding: 'Mod+O',
    execute: () => documents.open(demoDocument('scratch-' + sequence++)),
    enabled: (c) => !!c['workspace.open'],
  });
  add({
    id: 'document.save',
    title: 'Save Document',
    icon: 'save',
    category: 'Home',
    keybinding: 'Mod+S',
    execute: async () => {
      const doc = documents.active();
      if (doc) documents.save(doc.id);
      await app.persistence.flush();
      notifications.show('Document saved');
    },
    enabled: (c) => !!c['document.dirty'],
  });
  add({
    id: 'document.close',
    title: 'Close Document',
    icon: 'close',
    category: 'Home',
    keybinding: 'Mod+W',
    execute: async () => {
      const doc = documents.active();
      if (doc && (!doc.dirty || (await dialogs.confirm('Discard unsaved demo operation?')))) {
        documents.close(doc.id);
      }
    },
    enabled: (c) => !!c['document.open'],
  });
  add({
    id: 'document.demo.increment',
    title: 'Demo Operation',
    icon: 'select',
    category: 'Home',
    execute: () => {
      const doc = documents.active();
      if (!doc) return;
      const old = doc.value;
      app
        .history()
        .do({
          do: () => documents.change(doc.id, old + 1),
          undo: () => documents.change(doc.id, old),
        });
    },
    enabled: (c) => !!c['document.open'],
  });
  add({
    id: 'history.undo',
    title: 'Undo',
    icon: 'undo',
    category: 'Edit',
    keybinding: 'Mod+Z',
    execute: () => app.history().undo(),
    enabled: (c) => !!c['history.undo'],
  });
  add({
    id: 'history.redo',
    title: 'Redo',
    icon: 'redo',
    category: 'Edit',
    keybinding: 'Mod+Shift+Z',
    execute: () => app.history().redo(),
    enabled: (c) => !!c['history.redo'],
  });
  for (const id of Object.keys(panelTitles) as PanelId[]) {
    add({
      id: 'view.' + id + '.toggle',
      title: 'Toggle ' + panelTitles[id],
      icon: id === 'explorer' ? 'explorer' : id === 'inspector' ? 'inspector' : 'console',
      category: 'View',
      keybinding: id === 'explorer' ? 'Mod+B' : undefined,
      execute: () => layout.toggle(id),
    });
  }
  add({
    id: 'layout.reset',
    title: 'Reset Layout',
    icon: 'reset',
    category: 'View',
    execute: () => {
      layout.reset();
      const d = documents.state.snapshot();
      layout.syncDocuments(d.open, d.active);
      notifications.show('Layout restored');
    },
  });
  add({
    id: 'layout.undo',
    title: 'Undo Layout Change',
    icon: 'undo',
    category: 'View',
    execute: () => layout.undo(),
  });
  add({
    id: 'layout.redo',
    title: 'Redo Layout Change',
    icon: 'redo',
    category: 'View',
    execute: () => layout.redo(),
  });
  for (const id of ['explorer', 'inspector'] as const) {
    add({
      id: 'view.' + id + '.collapse',
      title: 'Collapse ' + panelTitles[id],
      icon: 'close',
      category: 'View',
      execute: () => layout.collapse(id),
    });
    add({
      id: 'view.' + id + '.float',
      title: 'Float ' + panelTitles[id],
      icon: 'inspector',
      category: 'View',
      execute: () => layout.float(id),
    });
  }
  add({
    id: 'command.palette',
    title: 'Command Palette',
    icon: 'palette',
    category: 'View',
    keybinding: 'Mod+Shift+P',
    execute: () => dialogs.patch({ palette: true }),
  });
  add({
    id: 'ribbon.cycle',
    title: 'Cycle Ribbon Mode',
    icon: 'ribbon',
    category: 'View',
    execute: () => {
      const s = settings.snapshot();
      const modes = ['full', 'slim', 'hidden'] as const;
      settings.set({ ...s, ribbonMode: modes[(modes.indexOf(s.ribbonMode) + 1) % 3] });
    },
  });
  add({
    id: 'view.zen',
    title: 'Toggle Focus Mode',
    icon: 'focus',
    category: 'View',
    keybinding: 'Mod+Shift+F',
    execute: () => {
      const zen = !app.ui.snapshot().zen;
      if (zen) {
        zenLayout = layout.save();
        for (const id of Object.keys(panelTitles) as PanelId[])
          if (layout.visible(id)) layout.hide(id);
      } else if (zenLayout) layout.restore(zenLayout);
      app.ui.set({ zen });
    },
  });
  add({
    id: 'jobs.demo.start',
    title: 'Run Demo Job',
    icon: 'play',
    category: 'Tools',
    keybinding: 'Mod+Shift+J',
    execute: async () => {
      await app.persistence.flush();
      await jobs.start();
      layout.show('jobs');
    },
    enabled: (c) => !!c['workspace.trusted'] && !c['job.running'],
  });
  add({
    id: 'jobs.demo.fail',
    title: 'Run Failing Demo Job',
    icon: 'diagnostics',
    category: 'Tools',
    execute: async () => {
      await app.persistence.flush();
      await jobs.start(true);
      layout.show('jobs');
    },
    enabled: (c) => !!c['workspace.trusted'] && !c['job.running'],
  });
  add({
    id: 'jobs.demo.cancel',
    title: 'Cancel Job',
    icon: 'cancel',
    category: 'Tools',
    execute: () => jobs.cancel(),
    enabled: (c) => !!c['job.running'],
  });
  add({
    id: 'workspace.trust.toggle',
    title: 'Toggle Workspace Trust',
    icon: 'trust',
    category: 'Tools',
    execute: () =>
      workspace.setTrust(workspace.state.snapshot().trust === 'trusted' ? 'untrusted' : 'trusted'),
  });
  add({
    id: 'diagnostics.show',
    title: 'Diagnostics',
    icon: 'diagnostics',
    category: 'Tools',
    execute: async () => {
      await app.diagnostics.refresh();
      const runtime = await app.api.runtimeInfo();
      dialogs.patch({
        info:
          runtime.version +
          ' · ' +
          runtime.capabilities.map((c) => c.name).join(', ') +
          '\n' +
          (app.diagnostics.state
            .snapshot()
            .map((d) => d.level + ': ' + d.message)
            .join('\n') || 'No errors recorded.'),
      });
    },
  });
  add({
    id: 'quick.input',
    title: 'Quick Input',
    icon: 'open',
    category: 'Home',
    execute: () => dialogs.patch({ quick: true }),
  });
  context.set('editor.focused', false);
}
