package jobs

import (
	"context"
	"testing"
	"time"
	"workbench/internal/runtime"
)

func wait(t *testing.T, s *Service, status string) {
	t.Helper()
	deadline := time.Now().Add(time.Second)
	for time.Now().Before(deadline) {
		if s.Snapshot()[0].Status == status {
			return
		}
		time.Sleep(time.Millisecond)
	}
	t.Fatalf("expected %s got %+v", status, s.Snapshot())
}
func TestCompleteCancelFail(t *testing.T) {
	for _, mode := range []string{"completed", "cancelled", "failed"} {
		t.Run(mode, func(t *testing.T) {
			m := runtime.NewMock()
			m.Step = time.Millisecond
			_ = m.Start(context.Background())
			s := New(m)
			defer s.Stop()
			j := s.Start(mode == "failed")
			if mode == "cancelled" {
				_ = s.Cancel(j.ID)
			}
			wait(t, s, mode)
			got := s.Snapshot()[0]
			if mode == "completed" && (got.Progress != 100 || got.Result == nil) {
				t.Fatal(got)
			}
			if mode == "failed" && got.Error == "" {
				t.Fatal("missing error")
			}
		})
	}
}
