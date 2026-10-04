package workspace

import (
	"errors"
	"regexp"
	"workbench/internal/app/documents"
	"workbench/internal/app/trust"
	"workbench/internal/persistence"
)

type State struct {
	SchemaVersion  int                  `json:"schemaVersion"`
	ID             string               `json:"id"`
	Title          string               `json:"title"`
	Documents      []documents.Document `json:"documents"`
	ActiveDocument string               `json:"activeDocument"`
	Layout         string               `json:"layout"`
	Trust          trust.Level          `json:"trust"`
}
type Service struct{ Store *persistence.Store }

var validID = regexp.MustCompile(`^[a-zA-Z0-9_-]{1,80}$`)

func Validate(s State) error {
	if s.SchemaVersion != 1 || !validID.MatchString(s.ID) {
		return errors.New("invalid workspace")
	}
	if s.Trust != trust.Trusted && s.Trust != trust.Untrusted {
		return errors.New("invalid trust")
	}
	seen := map[string]bool{}
	for _, d := range s.Documents {
		if d.ID == "" || seen[d.ID] {
			return errors.New("invalid document ID")
		}
		seen[d.ID] = true
	}
	if s.ActiveDocument != "" && !seen[s.ActiveDocument] {
		return errors.New("active document is not open")
	}
	return nil
}
func (s Service) Save(v State) error {
	if err := Validate(v); err != nil {
		return err
	}
	return s.Store.Save("workspaces/"+v.ID+".json", v)
}
func (s Service) Load(id string) (State, error) {
	var v State
	if !validID.MatchString(id) {
		return v, errors.New("invalid workspace ID")
	}
	err := s.Store.Load("workspaces/"+id+".json", &v)
	if err != nil {
		return v, err
	}
	v.SchemaVersion = 1
	if v.Trust == "" {
		v.Trust = trust.Untrusted
	}
	return v, Validate(v)
}
