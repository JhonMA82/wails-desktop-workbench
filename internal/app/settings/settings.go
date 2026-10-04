package settings

import (
	"errors"
	"os"
	"workbench/internal/persistence"
)

type State struct {
	SchemaVersion    int    `json:"schemaVersion"`
	Theme            string `json:"theme"`
	RibbonMode       string `json:"ribbonMode"`
	RestoreWorkspace bool   `json:"restoreWorkspace"`
}

func Default() State { return State{1, "dark", "full", true} }
func Validate(v State) error {
	if v.SchemaVersion != 1 || (v.Theme != "dark" && v.Theme != "light") || (v.RibbonMode != "full" && v.RibbonMode != "slim" && v.RibbonMode != "hidden") {
		return errors.New("invalid settings")
	}
	return nil
}

type Service struct{ Store *persistence.Store }

func (s Service) Load() (State, error) {
	v := Default()
	err := s.Store.Load("settings/user.json", &v)
	if errors.Is(err, os.ErrNotExist) {
		return v, nil
	}
	v.SchemaVersion = 1
	if err != nil {
		return v, err
	}
	return v, Validate(v)
}
func (s Service) Save(v State) error {
	if err := Validate(v); err != nil {
		return err
	}
	return s.Store.Save("settings/user.json", v)
}
