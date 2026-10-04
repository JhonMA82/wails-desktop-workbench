package platform

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"sync"
	"workbench/internal/app/diagnostics"
	"workbench/internal/app/jobs"
	"workbench/internal/app/settings"
	"workbench/internal/app/trust"
	"workbench/internal/app/workspace"
	"workbench/internal/persistence"
	"workbench/internal/runtime"
)

type Recovery struct {
	SchemaVersion int    `json:"schemaVersion"`
	WorkspaceID   string `json:"workspaceId"`
	RibbonMode    string `json:"ribbonMode"`
}
type Session struct {
	Settings    settings.State      `json:"settings"`
	Workspace   *workspace.State    `json:"workspace"`
	Diagnostics []diagnostics.Entry `json:"diagnostics"`
}
type Host struct {
	mu          sync.Mutex
	store       *persistence.Store
	settings    settings.Service
	workspaces  workspace.Service
	jobs        *jobs.Service
	diagnostics *diagnostics.Service
	adapter     runtime.Adapter
	active      workspace.State
}

func NewHost(root string) (*Host, error) {
	store := &persistence.Store{Root: root}
	adapter := runtime.NewMock()
	if err := adapter.Start(context.Background()); err != nil {
		return nil, err
	}
	return &Host{store: store, settings: settings.Service{Store: store}, workspaces: workspace.Service{Store: store}, jobs: jobs.New(adapter), diagnostics: &diagnostics.Service{}, adapter: adapter}, nil
}
func (h *Host) LoadSession() (Session, error) {
	s, err := h.settings.Load()
	if err != nil {
		h.diagnostics.Record("error", err.Error())
		return Session{}, err
	}
	session := Session{Settings: s}
	if s.RestoreWorkspace {
		var r Recovery
		err = h.store.Load("recovery/session.json", &r)
		if err == nil && r.WorkspaceID != "" {
			v, e := h.workspaces.Load(r.WorkspaceID)
			if e != nil {
				return session, e
			}
			h.mu.Lock()
			h.active = v
			h.mu.Unlock()
			session.Workspace = &v
		} else if err != nil && !errors.Is(err, os.ErrNotExist) {
			return session, err
		}
	}
	session.Diagnostics = h.diagnostics.Snapshot()
	return session, nil
}
func (h *Host) SaveWorkspace(v workspace.State) error {
	if v.Layout != "" && !json.Valid([]byte(v.Layout)) {
		return errors.New("invalid layout JSON")
	}
	if err := h.workspaces.Save(v); err != nil {
		return err
	}
	h.mu.Lock()
	h.active = v
	h.mu.Unlock()
	s, err := h.settings.Load()
	if err != nil {
		return err
	}
	return h.store.Save("recovery/session.json", Recovery{1, v.ID, s.RibbonMode})
}
func (h *Host) SaveSettings(v settings.State) error { return h.settings.Save(v) }
func (h *Host) StartJob(fail bool) (jobs.Job, error) {
	h.mu.Lock()
	level := h.active.Trust
	h.mu.Unlock()
	if err := trust.Require(level); err != nil {
		return jobs.Job{}, err
	}
	return h.jobs.Start(fail), nil
}
func (h *Host) CancelJob(id string) error        { return h.jobs.Cancel(id) }
func (h *Host) Jobs() []jobs.Job                 { return h.jobs.Snapshot() }
func (h *Host) Diagnostics() []diagnostics.Entry { return h.diagnostics.Snapshot() }
func (h *Host) RecordDiagnostic(level, message string) error {
	if level != "info" && level != "warning" && level != "error" {
		return errors.New("invalid diagnostic level")
	}
	h.diagnostics.Record(level, message)
	return nil
}
func (h *Host) RuntimeInfo() map[string]any {
	return map[string]any{"version": h.adapter.Version(), "capabilities": h.adapter.Capabilities()}
}
func (h *Host) Shutdown() { h.jobs.Stop(); _ = h.adapter.Stop(context.Background()) }
