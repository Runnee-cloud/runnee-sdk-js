import { HTTPClient, type RunneeOptions, type RequestOptions } from './http.js';
import type * as T from './types.js';
export * from './errors.js';
export type * from './types.js';
export type { RunneeOptions, RequestOptions, ResponseMetadata } from './http.js';
export interface ExecutionFilters {
  before?: string;
  status?: 'success' | 'failed';
  mode?: 'dry-run' | 'live';
}
export class Runnee {
  readonly #http: HTTPClient;
  constructor(apiKey: string, options?: Omit<RunneeOptions, 'apiKey'>);
  constructor(options?: RunneeOptions);
  constructor(
    apiKeyOrOptions: string | RunneeOptions = {},
    options: Omit<RunneeOptions, 'apiKey'> = {},
  ) {
    this.#http = new HTTPClient(
      typeof apiKeyOrOptions === 'string'
        ? { ...options, apiKey: apiKeyOrOptions }
        : apiKeyOrOptions,
    );
  }
  execute(input: T.ExecuteRequest, options?: RequestOptions): Promise<T.ExecuteResponse> {
    return this.#http.request('execute', {}, input, options);
  }
  readonly executions = {
    get: (id: string, options?: RequestOptions): Promise<T.ExecutionDetail> =>
      this.#http.request('executions.get', { id }, undefined, options),
    list: (filters: ExecutionFilters = {}, options?: RequestOptions): Promise<T.ExecutionPage> =>
      this.#http.request('executions.list', { ...filters }, undefined, options),
    iterate: (
      filters: ExecutionFilters = {},
      options?: RequestOptions,
    ): AsyncGenerator<T.Execution> => this.iterateExecutions(filters, options),
  };
  private async *iterateExecutions(
    filters: ExecutionFilters,
    options?: RequestOptions,
  ): AsyncGenerator<T.Execution> {
    let before = filters.before;
    const seen = new Set<string>();
    for (;;) {
      const page = await this.executions.list({ ...filters, before }, options);
      for (const item of page.items) yield item;
      if (!page.nextCursor) break;
      if (seen.has(page.nextCursor))
        throw new Error('Runnee returned a repeated pagination cursor.');
      seen.add(page.nextCursor);
      before = page.nextCursor;
    }
  }
  readonly scripts = {
    list: (options?: RequestOptions): Promise<T.ScriptList> =>
      this.#http.request('scripts.list', {}, undefined, options),
    create: (input: T.ScriptCreate, options?: RequestOptions): Promise<T.Script> =>
      this.#http.request('scripts.create', {}, input, options),
    get: (id: string, options?: RequestOptions): Promise<T.ScriptDetail> =>
      this.#http.request('scripts.get', { id }, undefined, options),
    update: (id: string, input: T.ScriptUpdate, options?: RequestOptions): Promise<T.Script> =>
      this.#http.request('scripts.update', { id }, input, options),
    delete: (id: string, options?: RequestOptions): Promise<T.Deleted> =>
      this.#http.request('scripts.delete', { id }, undefined, options),
    getVersion: (id: string, version: number, options?: RequestOptions): Promise<T.ScriptVersion> =>
      this.#http.request('scripts.getVersion', { id, version }, undefined, options),
    restore: (id: string, input: T.ScriptRestore, options?: RequestOptions): Promise<T.Script> =>
      this.#http.request('scripts.restore', { id }, input, options),
    storage: (options?: RequestOptions): Promise<T.Storage> =>
      this.#http.request('scripts.storage', {}, undefined, options),
  };
  readonly secrets = {
    list: (options?: RequestOptions): Promise<T.SecretList> =>
      this.#http.request('secrets.list', {}, undefined, options),
    get: (name: string, options?: RequestOptions): Promise<T.Secret> =>
      this.#http.request('secrets.get', { name }, undefined, options),
    create: (input: T.SecretCreate, options?: RequestOptions): Promise<T.Secret> =>
      this.#http.request('secrets.create', {}, input, options),
    update: (name: string, input: T.SecretUpdate, options?: RequestOptions): Promise<T.Secret> =>
      this.#http.request('secrets.update', { name }, input, options),
    delete: (name: string, options?: RequestOptions): Promise<T.Deleted> =>
      this.#http.request('secrets.delete', { name }, undefined, options),
  };
  readonly usage = {
    get: (options?: RequestOptions): Promise<T.BillingStatus> =>
      this.#http.request('usage.get', {}, undefined, options),
    summary: (options?: RequestOptions): Promise<T.UsageSummary> =>
      this.#http.request('usage.summary', {}, undefined, options),
    history: (days: 7 | 30 | 90 = 7, options?: RequestOptions): Promise<T.UsageHistory> =>
      this.#http.request('usage.history', { days }, undefined, options),
  };
  readonly sandbox = {
    get: (options?: RequestOptions): Promise<T.Sandbox> =>
      this.#http.request('sandbox.get', {}, undefined, options),
  };
  readonly billing = {
    plans: (options?: RequestOptions): Promise<T.Plans> =>
      this.#http.request('billing.plans', {}, undefined, options),
  };
  readonly health = {
    get: (options?: RequestOptions): Promise<T.Health> =>
      this.#http.request('health.get', {}, undefined, options),
  };
  readonly telemetry = {
    recordExecution: (
      input: T.TelemetryExecution,
      options?: RequestOptions,
    ): Promise<T.TelemetryRecorded> =>
      this.#http.request('telemetry.recordExecution', {}, input, options),
    recordEvent: (input: T.TelemetryEvent, options?: RequestOptions): Promise<T.Accepted> =>
      this.#http.request('telemetry.recordEvent', {}, input, options),
  };
}
