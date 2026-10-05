import { useState, useSyncExternalStore } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { usePresentation } from '../contract/presentation';
import { CommandPalette } from '../design-system/components/CommandPalette';
export function OverlayHost() {
  const app = usePresentation(),
    dialog = useSyncExternalStore(app.dialogs.state.subscribe, app.dialogs.state.snapshot),
    notification = useSyncExternalStore(
      app.notifications.state.subscribe,
      app.notifications.state.snapshot,
    );
  const [name, setName] = useState('');
  const open = Boolean(dialog.info || dialog.quick || dialog.confirm);
  return (
    <>
      <CommandPalette
        registry={app.commands}
        open={dialog.palette}
        onOpenChange={(palette) => app.dialogs.patch({ palette })}
      />
      <Dialog.Root
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            app.dialogs.answer(false);
            app.dialogs.patch({ info: null, quick: false });
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title>
              {dialog.quick ? 'Quick Input' : dialog.confirm ? 'Unsaved changes' : 'Diagnostics'}
            </Dialog.Title>
            <Dialog.Description>
              {dialog.quick
                ? 'Create a named demo resource.'
                : dialog.confirm
                  ? 'Choose whether to discard the unsaved operation.'
                  : 'Runtime capabilities and recorded errors.'}
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Close dialog">
              <X size={16} />
            </Dialog.Close>
            {dialog.info && <pre>{dialog.info}</pre>}
            {dialog.confirm && (
              <>
                <p>{dialog.confirm}</p>
                <div className="dialog-actions">
                  <button onClick={() => app.dialogs.answer(false)}>Keep editing</button>
                  <button onClick={() => app.dialogs.answer(true)}>Discard</button>
                </div>
              </>
            )}
            {dialog.quick && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name.trim()) return;
                  void app.commands.execute('quick.input', name);
                  setName('');
                }}
              >
                <input
                  autoFocus
                  aria-label="Document name"
                  placeholder="Resource name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button type="submit">Create</button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Toast.Provider duration={2500}>
        <Toast.Root
          className="notification"
          open={!!notification}
          onOpenChange={(v) => {
            if (!v) app.notifications.clear();
          }}
          key={notification?.id}
        >
          <Toast.Title>{notification?.message}</Toast.Title>
          <Toast.Close aria-label="Dismiss notification">
            <X size={14} />
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="toast-viewport" />
      </Toast.Provider>
    </>
  );
}
