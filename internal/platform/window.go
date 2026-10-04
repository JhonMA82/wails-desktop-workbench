package platform

import (
	"github.com/wailsapp/wails/v3/pkg/application"
	"sync"
	"workbench/internal/persistence"
)

type WindowState struct {
	SchemaVersion int `json:"schemaVersion"`
	Width         int `json:"width"`
	Height        int `json:"height"`
}

// DesktopShell owns only native window integration; application services stay Wails-free.
type DesktopShell struct {
	mu         sync.Mutex
	allowClose bool
	app        *application.App
	window     *application.WebviewWindow
	store      *persistence.Store
}

func NewShell(app *application.App, window *application.WebviewWindow, root string) *DesktopShell {
	return &DesktopShell{app: app, window: window, store: &persistence.Store{Root: root}}
}
func LoadWindow(root string) WindowState {
	v := WindowState{1, 1280, 800}
	_ = (&persistence.Store{Root: root}).Load("recovery/window.json", &v)
	if v.Width < 680 || v.Height < 480 || v.Width > 10000 || v.Height > 10000 {
		return WindowState{1, 1280, 800}
	}
	return v
}
func (s *DesktopShell) RequestClose() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.allowClose {
		return true
	}
	s.app.Event.Emit("workbench.closing")
	return false
}
func (s *DesktopShell) ConfirmClose() error {
	width, height := s.window.Size()
	if err := s.store.Save("recovery/window.json", WindowState{1, width, height}); err != nil {
		return err
	}
	s.mu.Lock()
	s.allowClose = true
	s.mu.Unlock()
	s.window.Close()
	return nil
}
