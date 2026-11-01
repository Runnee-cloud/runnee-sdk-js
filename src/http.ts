import { contracts } from './contracts.js';
import { validate, encodeRequest } from './validation.js';
import {
  RunneeError,
  RunneeAuthenticationError,
  RunneePermissionError,
  RunneeValidationError,
  RunneeRateLimitError,
  RunneeTimeoutError,
  RunneeNetworkError,
  RunneeServerError,
  RunneeConflictError,
  RunneeNotFoundError,
  RunneeResponseError,
  RunneeCancelledError,
} from './errors.js';
export interface ResponseMetadata {
  status: number;
  requestId?: string;
  rateLimitRemaining?: number;
}
export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  maxRetries?: number;
  idempotencyKey?: string;
  onResponse?: (metadata: ResponseMetadata) => void;
}
export interface RunneeOptions {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  fetch?: typeof globalThis.fetch;
  allowInsecureHTTP?: boolean;
}
interface Operation {
  id: string;
  method: string;
  path: string;
  request: string | null;
  response: string;
  scope: string | null;
}
const operations = contracts.operations as readonly Operation[];
function integer(n: number, min: number, max: number, name: string) {
  if (!Number.isSafeInteger(n) || n < min || n > max)
    throw new RunneeValidationError(name + ' is outside the supported range.');
  return n;
}
function retryAfter(raw: string | null): number | undefined {
  if (!raw) return;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) return n * 1000;
  const date = Date.parse(raw);
  if (Number.isFinite(date)) return Math.max(0, date - Date.now());
}
async function pause(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) throw new RunneeCancelledError('Request cancelled.');
  return new Promise((resolve, reject) => {
    const done = () => {
      signal.removeEventListener('abort', abort);
      resolve();
    };
    const timer = setTimeout(done, ms);
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      reject(new RunneeCancelledError('Request cancelled.'));
    };
    signal.addEventListener('abort', abort, { once: true });
  });
}
async function readJSON(response: Response): Promise<unknown> {
  if (!/\bapplication\/(?:[\w.+-]*\+)?json\b/i.test(response.headers.get('content-type') ?? ''))
    throw new RunneeResponseError('Runnee returned a non-JSON response.');
  const reader = response.body?.getReader();
  if (!reader) throw new RunneeResponseError('Runnee returned an empty response.');
  const decoder = new TextDecoder(),
    parts: string[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 5 * 1024 * 1024)
        throw new RunneeResponseError('Runnee response exceeds the SDK size limit.');
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
    try {
      return JSON.parse(parts.join('')) as unknown;
    } catch {
      throw new RunneeResponseError('Runnee returned invalid JSON.');
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}
export class HTTPClient {
  readonly #key: string;
  readonly #url: string;
  readonly #fetch: typeof fetch;
  readonly #timeout: number;
  readonly #retries: number;
  constructor(options: RunneeOptions = {}) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined')
      throw new RunneeValidationError(
        'Runnee API keys must be used on a trusted server, not in a public browser application.',
      );
    const env = (
      globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env;
    const key = options.apiKey ?? env?.RUNNEE_API_KEY;
    if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{8,512}$/.test(key))
      throw new RunneeAuthenticationError('Set a valid RUNNEE_API_KEY or provide apiKey.');
    let url: URL;
    try {
      url = new URL(options.baseURL ?? env?.RUNNEE_BASE_URL ?? 'https://api.runnee.cloud');
    } catch {
      throw new RunneeValidationError('baseURL must be an absolute HTTPS origin.');
    }
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/' ||
      !['https:', 'http:'].includes(url.protocol) ||
      (url.protocol === 'http:' &&
        !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
        !options.allowInsecureHTTP)
    )
      throw new RunneeValidationError(
        'baseURL requires HTTPS; HTTP is allowed only for loopback or explicit development use.',
      );
    this.#url = url.origin;
    this.#key = key;
    this.#timeout = integer(options.timeout ?? 30000, 1, 300000, 'timeout');
    this.#retries = integer(options.maxRetries ?? 2, 0, 5, 'maxRetries');
    this.#fetch = options.fetch ?? globalThis.fetch;
    if (typeof this.#fetch !== 'function')
      throw new RunneeValidationError('This runtime requires fetch or a fetch implementation.');
  }
  async request<T>(
    id: string,
    params: Record<string, string | number | undefined> = {},
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    if (options.signal && typeof options.signal.addEventListener !== 'function')
      throw new RunneeValidationError('signal must be an AbortSignal.');
    const op = operations.find((o) => o.id === id);
    if (!op) throw new RunneeValidationError('Unsupported SDK operation.');
    let pathname = op.path;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      const marker = '{' + key + '}';
      if (pathname.includes(marker)) {
        const encoded = String(value);
        if (!encoded || encoded === '.' || encoded === '..' || /[\/\\\x00-\x1f]/.test(encoded))
          throw new RunneeValidationError('Invalid resource identifier.');
        pathname = pathname.replace(marker, encodeURIComponent(encoded));
      } else query.set(key, String(value));
    }
    if (pathname.includes('{')) throw new RunneeValidationError('Missing resource identifier.');
    const requestBody =
      body && typeof body === 'object' && !Array.isArray(body)
        ? Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined))
        : body;
    if (op.request) validate(requestBody, op.request, false);
    const payload = requestBody === undefined ? undefined : encodeRequest(requestBody);
    if (
      options.idempotencyKey !== undefined &&
      (id !== 'execute' || !/^[A-Za-z0-9_.:-]{8,128}$/.test(options.idempotencyKey))
    )
      throw new RunneeValidationError('Use an 8–128 character idempotencyKey only for execute.');
    const safe = op.method === 'GET' || (id === 'execute' && !!options.idempotencyKey);
    const retries = integer(options.maxRetries ?? (safe ? this.#retries : 0), 0, 5, 'maxRetries');
    if (!safe && retries > 0)
      throw new RunneeValidationError(
        'Automatic retries require a read operation or idempotent execution.',
      );
    const controller = new AbortController(),
      abort = () => controller.abort();
    let timedOut = false;
    const timeout = integer(options.timeout ?? this.#timeout, 1, 300000, 'timeout');
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) controller.abort();
    try {
      for (let attempt = 0; ; attempt++) {
        if (controller.signal.aborted) throw new RunneeCancelledError('Request cancelled.');
        let response: Response;
        try {
          response = await this.#fetch(this.#url + pathname + (query.size ? '?' + query : ''), {
            method: op.method,
            headers: {
              Authorization: 'Bearer ' + this.#key,
              Accept: 'application/json',
              'User-Agent': 'runnee-js/0.1.0',
              ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
              ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
            },
            body: payload,
            signal: controller.signal,
            redirect: 'error',
            credentials: 'omit',
            cache: 'no-store',
          });
        } catch {
          if (controller.signal.aborted) throw new RunneeCancelledError('Request cancelled.');
          if (attempt < retries) {
            await pause(
              Math.min(10000, 250 * 2 ** attempt) * (0.5 + Math.random() * 0.5),
              controller.signal,
            );
            continue;
          }
          throw new RunneeNetworkError(
            'Unable to reach Runnee. An interrupted execution may still have run; inspect history before submitting with a new key.',
          );
        }
        const requestId = response.headers.get('x-request-id') ?? undefined;
        const remaining = response.headers.get('x-ratelimit-remaining');
        options.onResponse?.({
          status: response.status,
          requestId,
          rateLimitRemaining: remaining === null ? undefined : Number(remaining),
        });
        const after = retryAfter(response.headers.get('retry-after'));
        if (
          [429, 500, 502, 503, 504].includes(response.status) &&
          attempt < retries &&
          (after === undefined || after <= 60000)
        ) {
          await response.body?.cancel();
          await pause(
            after ?? Math.min(10000, 250 * 2 ** attempt) * (0.5 + Math.random() * 0.5),
            controller.signal,
          );
          continue;
        }
        if (!response.ok) {
          await response.body?.cancel();
          const E =
            response.status === 401
              ? RunneeAuthenticationError
              : response.status === 403
                ? RunneePermissionError
                : response.status === 404
                  ? RunneeNotFoundError
                  : response.status === 409
                    ? RunneeConflictError
                    : response.status === 429
                      ? RunneeRateLimitError
                      : response.status >= 500
                        ? RunneeServerError
                        : RunneeValidationError;
          const error = new E(
            response.status === 409
              ? 'The request conflicts with existing state. An execution may be admitted or its idempotency key reused; inspect history before submitting again.'
              : response.status === 401
                ? 'Invalid, expired or revoked Runnee API key.'
                : response.status === 403
                  ? 'The API key scope or resource access policy does not permit this operation.'
                  : 'Runnee API request failed (HTTP ' + response.status + ').',
            { status: response.status, requestId },
          );
          if (error instanceof RunneeRateLimitError)
            error.retryAfter = after === undefined ? undefined : after / 1000;
          throw error;
        }
        let value: unknown;
        try {
          value = await readJSON(response);
        } catch (e) {
          if (e instanceof RunneeResponseError)
            throw new RunneeResponseError(e.message, { status: response.status, requestId });
          if (controller.signal.aborted) throw e;
          if (attempt < retries) {
            await pause(
              Math.min(10000, 250 * 2 ** attempt) * (0.5 + Math.random() * 0.5),
              controller.signal,
            );
            continue;
          }
          throw new RunneeNetworkError(
            'Unable to read a complete Runnee response. Inspect history before resubmitting an uncertain execution.',
          );
        }
        validate(value, op.response, true, requestId);
        return value as T;
      }
    } catch (error) {
      if (timedOut)
        throw new RunneeTimeoutError(
          'Request timed out. Execution may still have completed; reuse its idempotency key or inspect history.',
        );
      if (options.signal?.aborted)
        throw new RunneeCancelledError(
          'Request cancelled. Remote execution cancellation is not guaranteed.',
        );
      if (error instanceof RunneeError) throw error;
      throw new RunneeNetworkError('Runnee request could not be completed.');
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', abort);
    }
  }
}
