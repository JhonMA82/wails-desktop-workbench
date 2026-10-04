package jobs

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"
	"workbench/internal/runtime"
)

type Job struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Status    string          `json:"status"`
	Progress  int             `json:"progress"`
	Message   string          `json:"message"`
	StartedAt string          `json:"startedAt"`
	Error     string          `json:"error"`
	Result    *runtime.Result `json:"result,omitempty"`
}
type Service struct {
	mu      sync.Mutex
	adapter runtime.Adapter
	next    int
	jobs    map[string]Job
	order   []string
	cancel  map[string]context.CancelFunc
}

func New(adapter runtime.Adapter) *Service {
	return &Service{adapter: adapter, jobs: map[string]Job{}, cancel: map[string]context.CancelFunc{}}
}
func (s *Service) Start(fail bool) Job {
	s.mu.Lock()
	s.next++
	id := fmt.Sprintf("job-%d", s.next)
	ctx, cancel := context.WithCancel(context.Background())
	j := Job{ID: id, Type: "demo.execute", Status: "queued", Message: "Queued", StartedAt: time.Now().UTC().Format(time.RFC3339)}
	s.jobs[id] = j
	s.order = append(s.order, id)
	s.cancel[id] = cancel
	s.mu.Unlock()
	go s.run(ctx, id, fail)
	return j
}
func (s *Service) run(ctx context.Context, id string, fail bool) {
	s.mutate(id, func(j *Job) {
		if j.Status != "cancelled" {
			j.Status = "running"
		}
	})
	result, err := s.adapter.Execute(ctx, runtime.Request{ID: id, Method: "demo.execute", Fail: fail}, func(p runtime.Progress) {
		s.mutate(id, func(j *Job) {
			if j.Status == "running" {
				j.Progress = p.Value
				j.Message = p.Message
			}
		})
	})
	s.mutate(id, func(j *Job) {
		if errors.Is(err, context.Canceled) || j.Status == "cancelled" {
			j.Status = "cancelled"
			j.Message = "Cancelled"
		} else if err != nil {
			j.Status = "failed"
			j.Error = err.Error()
			j.Message = "Failed"
		} else {
			j.Status = "completed"
			j.Progress = 100
			j.Result = &result
			j.Message = result.Message
		}
	})
	s.mu.Lock()
	delete(s.cancel, id)
	s.mu.Unlock()
}
func (s *Service) mutate(id string, fn func(*Job)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	j := s.jobs[id]
	fn(&j)
	s.jobs[id] = j
}
func (s *Service) Cancel(id string) error {
	s.mu.Lock()
	cancel := s.cancel[id]
	if cancel != nil {
		cancel()
		j := s.jobs[id]
		j.Status = "cancelled"
		j.Message = "Cancelled"
		s.jobs[id] = j
	}
	s.mu.Unlock()
	return s.adapter.Cancel(id)
}
func (s *Service) Snapshot() []Job {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]Job, 0, len(s.order))
	for _, id := range s.order {
		j := s.jobs[id]
		if j.Result != nil {
			r := *j.Result
			j.Result = &r
		}
		out = append(out, j)
	}
	return out
}
func (s *Service) Stop() {
	s.mu.Lock()
	for _, cancel := range s.cancel {
		cancel()
	}
	s.mu.Unlock()
}
