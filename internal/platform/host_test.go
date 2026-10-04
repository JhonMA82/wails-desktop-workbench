package platform

import (
	"sync"
	"testing"
	"workbench/internal/app/documents"
	"workbench/internal/app/settings"
	"workbench/internal/app/trust"
	"workbench/internal/app/workspace"
	"workbench/internal/persistence"
)

func TestPersistenceTrustAndDiagnostics(t *testing.T) {
	root := t.TempDir()
	h, err := NewHost(root)
	if err != nil {
		t.Fatal(err)
	}
	defer h.Shutdown()
	session, err := h.LoadSession()
	if err != nil || session.Workspace != nil {
		t.Fatalf("unexpected session %v %v", session, err)
	}
	s := settings.Default()
	s.RibbonMode = "slim"
	if err = h.SaveSettings(s); err != nil {
		t.Fatal(err)
	}
	v := workspace.State{SchemaVersion: 1, ID: "demo", Title: "Demo", Trust: trust.Trusted, Documents: []documents.Document{{ID: "d", Resource: "demo://d", Title: "Demo", Type: "demo", Metadata: map[string]string{}}}, ActiveDocument: "d", Layout: `{"layout":{"type":"row","children":[]}}`}
	if err = h.SaveWorkspace(v); err != nil {
		t.Fatal(err)
	}
	next, _ := NewHost(root)
	defer next.Shutdown()
	restored, err := next.LoadSession()
	if err != nil || restored.Workspace.ActiveDocument != "d" || restored.Settings.RibbonMode != "slim" || restored.Workspace.Layout != v.Layout {
		t.Fatalf("recovery failed %+v %v", restored, err)
	}
	if err = h.RecordDiagnostic("error", "unexpected failure"); err != nil {
		t.Fatal(err)
	}
	if len(h.Diagnostics()) != 1 {
		t.Fatal("missing diagnostic")
	}
	v.Trust = trust.Untrusted
	_ = h.SaveWorkspace(v)
	if _, err = h.StartJob(false); err == nil {
		t.Fatal("untrusted execution allowed")
	}
	if err = h.SaveWorkspace(workspace.State{SchemaVersion: 1, ID: "../outside", Trust: trust.Trusted}); err == nil {
		t.Fatal("unsafe workspace ID")
	}
}
func TestMigrationAndFutureSchema(t *testing.T) {
	store := &persistence.Store{Root: t.TempDir()}
	_ = store.Save("settings/user.json", map[string]any{"schemaVersion": 0, "theme": "dark", "ribbonMode": "slim", "restoreWorkspace": true})
	service := settings.Service{Store: store}
	v, err := service.Load()
	if err != nil || v.SchemaVersion != 1 {
		t.Fatal(v, err)
	}
	_ = store.Save("settings/user.json", map[string]any{"schemaVersion": 2})
	if _, err = service.Load(); err == nil {
		t.Fatal("future schema accepted")
	}
}
func TestAtomicPersistenceConcurrency(t *testing.T) {
	store := &persistence.Store{Root: t.TempDir()}
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			_ = store.Save("recovery/test.json", map[string]int{"schemaVersion": 1, "n": n})
		}(i)
	}
	wg.Wait()
	var v map[string]int
	if err := store.Load("recovery/test.json", &v); err != nil {
		t.Fatal(err)
	}
}
