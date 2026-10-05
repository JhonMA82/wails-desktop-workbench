# Runtime

Either React shell → shared Application API → Wails → Go host → optional runtime.

`internal/runtime.Adapter` is the stable engine boundary: `Probe`, `Start`, `Stop`, `Health`, `Version`, `Capabilities`, `Execute`, `Cancel`. Execute receives a context, request ID/method and progress callback, and returns a result or error. The UI sees jobs and application contracts, not runtime implementation details.

Only MockRuntime is bundled. It demonstrates a `demo.execute` capability, progress 0–100, cancellation, a result and an intentional failure. Go tests run it with a shorter step duration. The production demo takes approximately 3 seconds. There is no Python, Rust, C++, CAD or subprocess dependency.

Features capable of executing external code or processes must consult Workspace Trust.

The host enforces trust before starting even the mock demonstration. A future process adapter must enforce it too before spawning or dispatching execution.

## Future local process protocol (documented, not implemented)

Use a Go-owned process and stdin/stdout NDJSON. One UTF-8 JSON object per line. stdout is protocol-only; stderr is diagnostics. No HTTP server, gRPC, protobuf or WebSocket is required.

```json
{"protocolVersion":1,"requestId":"r-1","method":"execute","params":{"operation":"example"}}
{"protocolVersion":1,"requestId":"r-1","progress":{"value":50,"message":"Working"}}
{"protocolVersion":1,"requestId":"r-1","result":{"value":"done"}}
```

A failed terminal response replaces `result` with `error: {code, message}`. Exactly one result/error per request. Progress carries the same requestId. `cancel` references a target requestId; an acknowledgment is distinct from a terminal cancelled response. Host maps engine progress/results/errors to jobs. Add handshake/version/capabilities, bounded line sizes, timeouts and process cleanup when implementing an actual engine. Do not build these protocol mechanisms before a product needs them.

The browser preview is an explicit UI test fixture, not a real external runtime or production job backend.
