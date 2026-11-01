# Security policy

Report vulnerabilities privately through GitHub private vulnerability reporting for the repository, when enabled. If unavailable, use the Runnee contact form and request a private security channel; do not post credentials or exploitable details publicly.

API keys belong only on trusted servers. These SDKs execute code remotely and contain no interpreter. Requests use HTTPS by default, do not follow redirects, and do not log credentials or retain raw response bodies in exceptions. HTTP is limited to loopback unless explicitly enabled for development. Never disable TLS verification in production.

Only the latest released minor version receives fixes while the SDK is pre-1.0. Dependencies should be patched promptly. Caller-provided transports are trusted code and must preserve authentication and TLS protections.

Execution retries require an idempotency key. Receipt replays omit the original output, and a pending result is not evidence that execution failed. Client cancellation stops waiting; it does not guarantee remote cancellation.

Secrets are encrypted by Runnee and granted explicitly to executions. Management returns metadata only. Do not put credentials in script source, events, telemetry, replies or errors. Redaction covers common accidental verbatim/encoded disclosure; it cannot stop an authorized malicious script from transforming or sending a secret to an external endpoint. Review secret-enabled scripts and narrow HTTP permissions. SDK request bodies necessarily contain values during create/rotate; configure application/APM instrumentation to omit them.
