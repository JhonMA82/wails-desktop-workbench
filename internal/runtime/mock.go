package runtime

import (
	"context"
	"errors"
	"sync"
	"time"
)

type MockRuntime struct {
	mu      sync.Mutex
	running bool
	active  map[string]context.CancelFunc
	Step    time.Duration
}

func NewMock() *MockRuntime {
	return &MockRuntime{active: map[string]context.CancelFunc{}, Step: 150 * time.Millisecond}
}
func (m *MockRuntime) Probe(context.Context) error { return nil }
func (m *MockRuntime) Start(context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.running = true
	return nil
}
func (m *MockRuntime) Stop(context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, cancel := range m.active {
		cancel()
	}
	m.running = false
	return nil
}
func (m *MockRuntime) Health(context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if !m.running {
		return errors.New("runtime stopped")
	}
	return nil
}
func (m *MockRuntime) Version() string            { return "mock/1" }
func (m *MockRuntime) Capabilities() []Capability { return []Capability{{"demo.execute", true}} }
func (m *MockRuntime) Execute(parent context.Context, r Request, report func(Progress)) (Result, error) {
	if err := m.Health(parent); err != nil {
		return Result{}, err
	}
	if r.Method != "demo.execute" {
		return Result{}, errors.New("unknown method")
	}
	ctx, cancel := context.WithCancel(parent)
	m.mu.Lock()
	m.active[r.ID] = cancel
	m.mu.Unlock()
	defer func() { cancel(); m.mu.Lock(); delete(m.active, r.ID); m.mu.Unlock() }()
	for p := 0; p <= 100; p += 5 {
		select {
		case <-ctx.Done():
			return Result{}, ctx.Err()
		case <-time.After(m.Step):
			report(Progress{p, "Processing demo operation"})
		}
		if r.Fail && p >= 40 {
			return Result{}, errors.New("intentional demo failure")
		}
	}
	return Result{"Demo operation completed"}, nil
}
func (m *MockRuntime) Cancel(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if cancel := m.active[id]; cancel != nil {
		cancel()
	}
	return nil
}
