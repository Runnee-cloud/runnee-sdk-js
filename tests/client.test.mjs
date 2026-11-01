import { test } from './test-runtime.mjs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import {
  Runnee,
  RunneeAuthenticationError,
  RunneePermissionError,
  RunneeRateLimitError,
  RunneeTimeoutError,
  RunneeNetworkError,
  RunneeValidationError,
  RunneeResponseError,
  RunneeCancelledError,
  RunneeConflictError,
} from '../lib/esm/index.js';
const key = 'rne_' + 'T'.repeat(43),
  json = (v, status = 200, headers = {}) =>
    new Response(JSON.stringify(v), {
      status,
      headers: { 'content-type': 'application/json', 'x-request-id': 'req-test', ...headers },
    });
const client = (fetch, options = {}) => new Runnee({ apiKey: key, fetch, ...options });
test('ESM and CommonJS expose identical client APIs', () => {
  const require = createRequire(import.meta.url);
  assert.equal(typeof require('../lib/cjs/index.js').Runnee, 'function');
  assert.equal(typeof Runnee, 'function');
});
test('remote execute uses real API shape, auth header, User-Agent and defaults', async () => {
  let captured;
  const c = client(async (url, init) => {
    captured = { url, init };
    return json({
      success: true,
      executionResult: { durationMs: 1, instructions: 5, returnValue: 30, replies: { count: 0 } },
    });
  });
  const r = await c.execute({ code: 'function main(){return 30;}' });
  assert.equal(r.executionResult.returnValue, 30);
  assert.equal(captured.url, 'https://api.runnee.cloud/api/runtime/execute');
  assert.equal(captured.init.headers.Authorization, 'Bearer ' + key);
  assert.equal(captured.init.redirect, 'error');
  assert.match(captured.init.headers['User-Agent'], /^runnee-js\//);
  assert.ok(!captured.url.includes(key));
});
test('per-call response metadata tracks request ID', async () => {
  let meta;
  await client(async () => json({ items: [] })).secrets.list({
    onResponse: (value) => (meta = value),
  });
  assert.equal(meta.requestId, 'req-test');
});
for (const [status, E] of [
  [401, RunneeAuthenticationError],
  [403, RunneePermissionError],
  [409, RunneeConflictError],
  [429, RunneeRateLimitError],
])
  test('typed safe API error ' + status, async () => {
    let calls = 0;
    await assert.rejects(
      client(async () => {
        calls++;
        return json({ message: key }, status, { 'retry-after': '120' });
      }).execute({ code: 'function main(){}' }),
      (e) =>
        e instanceof E &&
        e.status === status &&
        e.requestId === 'req-test' &&
        !String(e).includes(key),
    );
    assert.equal(calls, 1);
  });
test('safe reads respect Retry-After and retry only transient failures', async () => {
  let calls = 0;
  const result = await client(async () =>
    ++calls === 1 ? json({}, 429, { 'retry-after': '0' }) : json({ items: [] }),
  ).secrets.list();
  assert.deepEqual(result, { items: [] });
  assert.equal(calls, 2);
});
test('writes never silently retry', async () => {
  let calls = 0;
  await assert.rejects(
    client(async () => {
      calls++;
      throw new Error('network ' + key);
    }).execute({ code: 'function main(){}' }),
    RunneeNetworkError,
  );
  assert.equal(calls, 1);
  await assert.rejects(
    client(async () => json({ success: true })).execute(
      { code: 'function main(){}' },
      { maxRetries: 1 },
    ),
    RunneeValidationError,
  );
});
test('idempotent execution retries keep the same key and support receipt-only replay', async () => {
  const keys = [];
  const r = await client(async (_, init) => {
    keys.push(init.headers['Idempotency-Key']);
    return keys.length === 1
      ? json({}, 503, { 'retry-after': '0' })
      : json({ success: true, replayed: true, originalResultOmitted: true });
  }).execute({ code: 'function main(){}' }, { idempotencyKey: 'business-order-123' });
  assert.equal(r.originalResultOmitted, true);
  assert.deepEqual(keys, ['business-order-123', 'business-order-123']);
});
test('timeout and caller cancellation do not retry execution', async () => {
  const slow = (_, init) =>
    new Promise((_, reject) => {
      init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    });
  await assert.rejects(
    client(slow).execute({ code: 'function main(){}' }, { timeout: 10 }),
    RunneeTimeoutError,
  );
  const ac = new AbortController();
  ac.abort();
  await assert.rejects(
    client(slow).execute({ code: 'function main(){}' }, { signal: ac.signal }),
    RunneeCancelledError,
  );
});
test('unexpected JSON, missing fields, HTML and oversized responses are rejected', async () => {
  for (const response of [
    json({}),
    new Response('bad', { headers: { 'content-type': 'application/json' } }),
    new Response('<html/>', { headers: { 'content-type': 'text/html' } }),
    new Response('x'.repeat(5 * 1024 * 1024 + 1), {
      headers: { 'content-type': 'application/json' },
    }),
  ])
    await assert.rejects(
      client(async () => response).execute({ code: 'function main(){}' }),
      RunneeResponseError,
    );
});
test('validate inputs and reject identifier traversal and insecure URLs', async () => {
  for (const baseURL of [
    'http://example.com',
    'https://x.test/anything',
    'https://key@x.test',
    'file:///secret',
  ])
    assert.throws(() => client(async () => json({}), { baseURL }), RunneeValidationError);
  await assert.rejects(client(async () => json({})).scripts.get('../admin'), RunneeValidationError);
  await assert.rejects(
    client(async () => json({})).secrets.create({ name: 'bad', value: '123' }),
    RunneeValidationError,
  );
});
test('pagination follows cursor and retains filters', async () => {
  const urls = [];
  const c = client(async (url) => {
    urls.push(String(url));
    return json({
      items: [
        {
          id: String(urls.length),
          mode: 'live',
          status: 'success',
          durationMs: 1,
          instructionsUsed: 1,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      nextCursor: urls.length === 1 ? '12' : null,
      policy: {},
    });
  });
  const items = [];
  for await (const item of c.executions.iterate({ status: 'success' })) items.push(item.id);
  assert.deepEqual(items, ['1', '2']);
  assert.match(urls[1], /status=success/);
  assert.match(urls[1], /before=12/);
});
test('script failures are result data rather than HTTP errors', async () => {
  assert.equal(
    (
      await client(async () =>
        json({
          success: false,
          error: { message: 'Script rejected input', code: 'RUNNEE_RUNTIME_ERROR' },
        }),
      ).execute({ code: 'function main(){}' })
    ).success,
    false,
  );
});
test('secrets management sends values only in write bodies', async () => {
  const requests = [];
  const record = {
    name: 'EXTERNAL_API_KEY',
    allowInline: true,
    scriptIds: [],
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  const c = client(async (url, init) => {
    requests.push({ url, init });
    return json(
      init.method === 'DELETE'
        ? { deleted: true }
        : init.method === 'GET' && url.endsWith('/secrets')
          ? { items: [record] }
          : record,
    );
  });
  await c.secrets.create({ name: record.name, value: 'sensitive-value', allowInline: true });
  await c.secrets.update(record.name, { value: 'replacement-value' });
  assert.equal((await c.secrets.get(record.name)).name, record.name);
  assert.equal((await c.secrets.list()).items.length, 1);
  await c.secrets.delete(record.name);
  assert.ok(requests.every((r) => !r.url.includes('sensitive-value')));
  assert.ok(
    requests.filter((r) => r.init.method === 'GET').every((r) => r.init.body === undefined),
  );
});

test('invalid JSON request data fails before network I/O or retries', async () => {
  let calls = 0;
  const c = client(async () => {
    calls++;
    return json({ success: true });
  });
  const cyclic = {};
  cyclic.self = cyclic;
  for (const event of [{ invalid: 1n }, { invalid: NaN }, { invalid: () => {} }, cyclic])
    await assert.rejects(c.execute({ code: 'function main(){}', event }), RunneeValidationError);
  assert.equal(calls, 0);
});

test('partial network responses retry safe reads but never unprotected execution', async () => {
  let calls = 0;
  const broken = () =>
    new Response(
      new ReadableStream({
        start(controller) {
          controller.error(new Error('interrupted'));
        },
      }),
      { headers: { 'content-type': 'application/json' } },
    );
  const c = client(async () => (++calls === 1 ? broken() : json({ items: [] })));
  assert.deepEqual(await c.secrets.list(), { items: [] });
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(
    client(async () => {
      calls++;
      return broken();
    }).execute({ code: 'function main(){}' }),
    RunneeNetworkError,
  );
  assert.equal(calls, 1);
});

test('positional API key is used by the constructor and accepts optional configuration', async () => {
  let auth;
  const c = new Runnee(key, {
    baseURL: 'http://localhost:4321',
    fetch: async (_url, init) => {
      auth = init.headers.Authorization;
      return json({ success: true });
    },
  });
  assert.equal((await c.execute({ code: 'function main(){}' })).success, true);
  assert.equal(auth, 'Bearer ' + key);
  assert.throws(() => new Runnee(''), RunneeAuthenticationError);
});
