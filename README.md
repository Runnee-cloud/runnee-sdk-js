# @runnee/sdk

Official server-side JavaScript and TypeScript SDK for Runnee Cloud. Scripts execute remotely on Runnee infrastructure. This package contains no interpreter.

## Installation

Release candidate: these commands apply after publication. For local development run npm ci and npm run build from this repository.

```sh
npm install @runnee/sdk
bun add @runnee/sdk
pnpm add @runnee/sdk
yarn add @runnee/sdk
```

Node.js 22+ and Bun with native fetch are supported. ESM and CommonJS exports include TypeScript declarations. Trusted server runtimes providing fetch, AbortController and Web Streams can inject fetch; browser pages are rejected to prevent exposing secret keys.

## Quickstart

Set RUNNEE_API_KEY on your server. Create a key with scripts:execute in the dashboard.

```ts
import { Runnee } from "@runnee/sdk";
const runnee = new Runnee(process.env.RUNNEE_API_KEY!);
const result = await runnee.execute({
  code: "function main() { return 10 + 20; }",
  mode: "dry-run",
});
if (result.success && result.executionResult) {
  console.log(result.executionResult.returnValue);
}
```

CommonJS: const { Runnee } = require("@runnee/sdk"); const runnee = new Runnee(process.env.RUNNEE_API_KEY). Next.js: use only in server routes/actions, never a client component. Express, Fastify, NestJS and Hono can reuse one server-side client.

## Configuration and reliability

new Runnee(apiKey, { baseURL: "https://api.runnee.cloud", timeout: 30000, maxRetries: 2, fetch })

RUNNEE_BASE_URL is an optional environment fallback. baseURL is an origin; the SDK adds /api paths. HTTP is accepted for loopback tests, or through allowInsecureHTTP for explicit development only. No redirects are followed. timeout is in milliseconds and bounds the whole request, retries and backoff. RequestOptions supports signal, timeout, maxRetries, idempotencyKey and onResponse({status,requestId,rateLimitRemaining}).

GET requests retry transient network errors and 429/500/502/503/504 up to two times. Backoff is exponential with jitter and respects Retry-After. Authentication and permission errors are never retried. Writes default to no retries. Execute may retry only with an explicit idempotencyKey; use a business-operation key and retain it across uncertain results. Replays are receipts with originalResultOmitted, not cached output. Pending/conflicting claims produce HTTP409; inspect history. Keys expire after 24 hours, so do not treat them as permanent deduplication.

AbortController cancels the client request, not guaranteed remote execution. Timeout or cancellation can happen after billing/admission. Do not submit a new key just because the connection ended.

## API reference

- execute(input, options?): code, mode, event (read as ctx.input), retainSource, scriptName, secretNames, scriptId.
- executions.list({before,status,mode}?, options?), get(id, options?), iterate(filters?, options?): 20-item cursor pages, newest first; retained for 3 days with bounded history.
- scripts.list/create/get/update/delete/getVersion/restore/storage. update requires expectedVersion and complete name/code; restore creates a new revision. List is bounded, not paginated.
- secrets.list/get/create/update/delete: names identify secrets, values are write-only. create accepts {name,value,allowInline?,scriptIds?}; default policy denies all execution access. update accepts value and/or policy. Delete is irreversible.
- usage.get/summary/history(7|30|90), sandbox.get, billing.plans, health.get.
- telemetry.recordExecution(input), telemetry.recordEvent(input). External execution records consume quota. Do not send secrets in telemetry.

See openapi.json for exact wire schemas and generated src/types.ts for all types. API-key issuance/revocation, account management, payment mutations and execution cancellation are session-only or unsupported; there are no fictional SDK methods for them.

## Secrets

```ts
await runnee.secrets.create({ name: "EXTERNAL_API_KEY", value: process.env.EXTERNAL_API_KEY!, allowInline: true });
const result = await runnee.execute({
  code: 'use("secrets"); function main() { return secrets.has("EXTERNAL_API_KEY"); }',
  secretNames: ["EXTERNAL_API_KEY"],
});
await runnee.secrets.update("EXTERNAL_API_KEY", { value: process.env.REPLACEMENT_API_KEY! });
await runnee.secrets.delete("EXTERNAL_API_KEY");
```

Use secrets:write for management, secrets:read for metadata and scripts:execute plus secrets:use for execution grants. Prefer scriptIds over allowInline. Supply scriptId and the exact current saved source when executing a bound secret. No secret is injected automatically, including Dry run. Metadata never includes values. Review SECURITY.md for redaction boundaries.

## Errors

All exceptions extend RunneeError and expose status/requestId where available. Authentication, Permission, Validation, RateLimit, Timeout, Network, Server, Conflict, NotFound, Response and Cancelled errors have Runnee-prefixed classes. RunneeRateLimitError.retryAfter is seconds. A RunneeScript failure is a successful HTTP response with success:false and error; it does not throw an API exception.

## Development

npm install; npm run build; npm test; npm run typecheck; npm run format:check. CI checks Node22/24, Bun, ESM, CJS and TypeScript. Tests use synthetic credentials and controlled HTTP transports; run a separate staging API smoke check before release. See CONTRIBUTING.md, SECURITY.md and CHANGELOG.md. MIT licensed. npm publish requires explicit approval; see RELEASING.md.
