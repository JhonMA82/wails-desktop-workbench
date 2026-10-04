package persistence

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// Store writes independent, versioned records. It never merges application state.
type Store struct {
	Root string
	mu   sync.Mutex
}

func (s *Store) path(name string) (string, error) {
	if filepath.IsAbs(name) || strings.Contains(name, "..") {
		return "", errors.New("invalid record name")
	}
	return filepath.Join(s.Root, name), nil
}
func (s *Store) Load(name string, target any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	p, err := s.path(name)
	if err != nil {
		return err
	}
	b, err := os.ReadFile(p)
	if err != nil {
		return err
	}
	var header struct {
		SchemaVersion int `json:"schemaVersion"`
	}
	if err = json.Unmarshal(b, &header); err != nil {
		return err
	}
	if header.SchemaVersion > 1 {
		return fmt.Errorf("unsupported schemaVersion %d", header.SchemaVersion)
	}
	// v0 -> v1: the original demo fields retain their meaning; owners apply defaults.
	return json.Unmarshal(b, target)
}
func (s *Store) Save(name string, value any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	p, err := s.path(name)
	if err != nil {
		return err
	}
	if err = os.MkdirAll(filepath.Dir(p), 0700); err != nil {
		return err
	}
	b, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	f, err := os.CreateTemp(filepath.Dir(p), ".record-*")
	if err != nil {
		return err
	}
	tmp := f.Name()
	defer os.Remove(tmp)
	if _, err = f.Write(b); err == nil {
		err = f.Sync()
	}
	closeErr := f.Close()
	if err != nil {
		return err
	}
	if closeErr != nil {
		return closeErr
	}
	return os.Rename(tmp, p)
}
