package diagnostics

import (
	"sync"
	"time"
)

type Entry struct {
	Level   string `json:"level"`
	Message string `json:"message"`
	At      string `json:"at"`
}
type Service struct {
	mu      sync.Mutex
	entries []Entry
}

func (s *Service) Record(level, message string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.entries = append(s.entries, Entry{level, message, time.Now().UTC().Format(time.RFC3339)})
	if len(s.entries) > 100 {
		s.entries = s.entries[len(s.entries)-100:]
	}
}
func (s *Service) Snapshot() []Entry {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]Entry{}, s.entries...)
}
