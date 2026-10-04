package runtime

import "context"

type Capability struct {
	Name        string `json:"name"`
	Cancellable bool   `json:"cancellable"`
}
type Request struct {
	ID     string
	Method string
	Fail   bool
}
type Progress struct {
	Value   int
	Message string
}
type Result struct {
	Message string `json:"message"`
}

// Adapter isolates an engine. It is independent of Wails and of the Workbench UI.
type Adapter interface {
	Probe(context.Context) error
	Start(context.Context) error
	Stop(context.Context) error
	Health(context.Context) error
	Version() string
	Capabilities() []Capability
	Execute(context.Context, Request, func(Progress)) (Result, error)
	Cancel(string) error
}
