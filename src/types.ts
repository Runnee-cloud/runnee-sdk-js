// Generated from ../openapi/openapi.json. Do not edit.
export type Error = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: string;
  [key: string]: unknown;
};
export type ExecuteRequest = {
  code: string;
  mode?: 'dry-run' | 'live';
  event?: { [key: string]: unknown };
  retainSource?: boolean;
  scriptName?: string;
  secretNames?: string[];
  scriptId?: string;
};
export type Diagnostic = {
  code?: string;
  message: string;
  line?: number;
  column?: number;
  filename?: string;
  snippet?: string;
  [key: string]: unknown;
};
export type Timings = { [key: string]: number };
export type ExecutionResult = {
  durationMs: number;
  instructions: number;
  returnValue?: unknown;
  replies: { count: number; lastPayload?: unknown };
  counters?: { dbOps: number; httpCalls: number };
  explain?: { [key: string]: unknown };
};
export type ExecuteResponse = {
  success: boolean;
  mocked?: boolean;
  error?: Diagnostic;
  executionResult?: ExecutionResult;
  replies?: unknown[];
  metrics?: { [key: string]: unknown };
  telemetryRecorded?: boolean;
  executionId?: string | null;
  replayed?: boolean;
  originalResultOmitted?: boolean;
  [key: string]: unknown;
};
export type Policy = { [key: string]: unknown };
export type Execution = {
  id: string;
  scriptName?: string | null;
  mode: string;
  status: string;
  durationMs: number;
  instructionsUsed: number;
  errorCode?: string | null;
  httpCalls?: number;
  dbOps?: number;
  errorMessage?: string | null;
  hasSource?: boolean;
  timings?: Timings;
  createdAt: string;
  expiresAt?: string;
  [key: string]: unknown;
};
export type ExecutionDetail = {
  id: string;
  scriptName?: string | null;
  mode: string;
  status: string;
  durationMs: number;
  instructionsUsed: number;
  errorCode?: string | null;
  httpCalls?: number;
  dbOps?: number;
  errorMessage?: string | null;
  hasSource?: boolean;
  timings?: Timings;
  createdAt: string;
  expiresAt?: string;
  sourceCode?: string | null;
  outputPreview?: string | null;
  [key: string]: unknown;
};
export type ExecutionPage = { items: Execution[]; nextCursor: string | null; policy: Policy };
export type Script = {
  id: string;
  name: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
};
export type ScriptDetail = {
  id: string;
  name: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  code: string;
  versions: { version: number; createdAt: string; bytes: number }[];
  [key: string]: unknown;
};
export type ScriptList = { items: Script[]; policy: Policy };
export type ScriptCreate = { name: string; code: string };
export type ScriptUpdate = { name: string; code: string; expectedVersion: number };
export type ScriptRestore = { version: number; expectedVersion: number };
export type ScriptVersion = { version: number; code: string; createdAt: string };
export type Deleted = { deleted: boolean };
export type Storage = {
  policy: Policy;
  history: { count: number; bytes: number };
  scripts: { count: number; versions: number; bytes: number };
};
export type Secret = {
  name: string;
  allowInline: boolean;
  scriptIds: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type SecretList = { items: Secret[] };
export type SecretCreate = {
  name: string;
  value: string;
  allowInline?: boolean;
  scriptIds?: string[];
};
export type SecretUpdate = { value?: string; allowInline?: boolean; scriptIds?: string[] };
export type SandboxLimits = { timeoutMs: number; maxInstructions: number; maxMemoryMb: number };
export type Sandbox = {
  plan: string;
  configurable: boolean;
  limits: SandboxLimits;
  defaults: SandboxLimits;
  maxLimits: SandboxLimits;
};
export type Plan = {
  id: string;
  configurable?: boolean;
  limits: SandboxLimits;
  maxLimits?: SandboxLimits;
  name: string;
  monthlyUsd?: number | null;
  yearlyMonthlyUsd?: number | null;
  usageUsdPer1k?: number;
  executionsPerMonth: number | null;
  timeoutMs?: number;
  features?: string[];
  [key: string]: unknown;
};
export type Plans = { configured: boolean; plans: Plan[] };
export type BillingStatus = {
  configured: boolean;
  plan: Plan;
  subscription: {
    status?: string;
    interval?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    hasCustomer?: boolean;
    [key: string]: unknown;
  } | null;
  usage: { executions: number; limit: number | null; resetsAt: string };
};
export type UsageSummary = {
  windowDays: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDurationMs: number;
  latest: { [key: string]: unknown }[];
};
export type UsageHistory = {
  days: number;
  total: number;
  success: number;
  failed: number;
  successRate: number;
  daily: { date: string; total: number; success: number; failed: number; avgDurationMs: number }[];
  topScripts: { name: string; count: number }[];
  topScriptsSample: { days: number; limit: number };
  apiKeys: { active: number; lastUsedAt: string | null };
};
export type TelemetryExecution = {
  scriptName?: string;
  mode?: string;
  status: string;
  durationMs: number;
  instructionsUsed: number;
  memoryUsageKb?: number;
  errorCode?: string;
  metadata?: { [key: string]: unknown };
};
export type TelemetryEvent = {
  eventName: string;
  pagePath?: string;
  sessionId?: string;
  fingerprintHash?: string;
  properties?: { [key: string]: string | number | boolean | null };
};
export type TelemetryRecorded = { [key: string]: unknown } | string | null;
export type Accepted = { accepted: boolean };
export type Health = {
  status: 'operational' | 'degraded';
  timestamp: string;
  services: { id: string; name: string; status: 'operational' | 'degraded' }[];
};
