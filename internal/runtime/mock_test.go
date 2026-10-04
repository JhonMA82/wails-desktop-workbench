package runtime

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestAdapterContract(t *testing.T) {
	var adapter Adapter = NewMock()
	m := adapter.(*MockRuntime)
	m.Step = time.Millisecond
	ctx := context.Background()
	if adapter.Probe(ctx) != nil || adapter.Start(ctx) != nil || adapter.Health(ctx) != nil {
		t.Fatal("runtime lifecycle")
	}
	if adapter.Version() == "" || len(adapter.Capabilities()) != 1 {
		t.Fatal("runtime info")
	}
	progress := 0
	result, err := adapter.Execute(ctx, Request{ID: "r1", Method: "demo.execute"}, func(p Progress) { progress = p.Value })
	if err != nil || progress != 100 || result.Message == "" {
		t.Fatal(result, err)
	}
	cancelCtx, cancel := context.WithCancel(ctx)
	cancel()
	_, err = adapter.Execute(cancelCtx, Request{ID: "r2", Method: "demo.execute"}, func(Progress) {})
	if !errors.Is(err, context.Canceled) {
		t.Fatal(err)
	}
	_ = adapter.Stop(ctx)
	if adapter.Health(ctx) == nil {
		t.Fatal("stop ineffective")
	}
}
