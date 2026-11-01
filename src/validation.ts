import { contracts } from './contracts.js';
import { RunneeResponseError, RunneeValidationError } from './errors.js';
type Schema = {
  type?: string;
  properties?: Record<string, Schema>;
  required?: readonly string[];
  additionalProperties?: boolean | Schema;
  items?: Schema;
  enum?: readonly unknown[];
  anyOf?: readonly Schema[];
  $ref?: string;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  uniqueItems?: boolean;
  minProperties?: number;
  format?: string;
};
const schemas = contracts.schemas as unknown as Record<string, Schema>;
function valid(value: unknown, s: Schema, depth = 0): boolean {
  if (depth > 40) return false;
  if (s.$ref) return valid(value, schemas[s.$ref.split('/').pop()!], depth + 1);
  if (s.anyOf) return s.anyOf.some((sub) => valid(value, sub, depth + 1));
  if (s.enum && !s.enum.includes(value)) return false;
  if (s.type === 'null') return value === null;
  if (s.type === 'boolean') return typeof value === 'boolean';
  if (s.type === 'number' || s.type === 'integer')
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      (s.type !== 'integer' || Number.isSafeInteger(value)) &&
      (s.minimum === undefined || value >= s.minimum) &&
      (s.maximum === undefined || value <= s.maximum)
    );
  if (s.type === 'string')
    return (
      typeof value === 'string' &&
      (s.minLength === undefined || value.length >= s.minLength) &&
      (s.maxLength === undefined || value.length <= s.maxLength) &&
      (!s.pattern || new RegExp(s.pattern).test(value)) &&
      (s.format !== 'uuid' || /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(value))
    );
  if (s.type === 'array')
    return (
      Array.isArray(value) &&
      (s.minItems === undefined || value.length >= s.minItems) &&
      (s.maxItems === undefined || value.length <= s.maxItems) &&
      (!s.uniqueItems || new Set(value.map((v) => JSON.stringify(v))).size === value.length) &&
      value.every((v) => valid(v, s.items ?? {}, depth + 1))
    );
  if (s.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const record = value as Record<string, unknown>;
    return (
      (!s.minProperties || Object.keys(record).length >= s.minProperties) &&
      (s.required ?? []).every((k) => Object.hasOwn(record, k)) &&
      Object.entries(record).every(([k, v]) =>
        Object.hasOwn(s.properties ?? {}, k)
          ? valid(v, s.properties![k], depth + 1)
          : s.additionalProperties === false
            ? false
            : typeof s.additionalProperties === 'object'
              ? valid(v, s.additionalProperties, depth + 1)
              : true,
      )
    );
  }
  return true;
}
export function validate(
  value: unknown,
  name: string,
  response: boolean,
  requestId?: string,
): void {
  if (!schemas[name] || !valid(value, schemas[name])) {
    const ErrorClass = response ? RunneeResponseError : RunneeValidationError;
    throw new ErrorClass(
      response
        ? 'Runnee returned an unexpected response.'
        : 'Request does not match the Runnee API contract.',
      { requestId },
    );
  }
}

/** Reject non-JSON inputs before I/O; serialization failures must never look retryable. */
export function encodeRequest(value: unknown): string {
  const ancestors = new Set<object>();
  let count = 0,
    characters = 0;
  const walk = (v: unknown, depth = 0): void => {
    if (++count > 10000 || depth > 20)
      throw new RunneeValidationError('Request JSON exceeds the nesting or value limit.');
    if (v === null || typeof v === 'boolean') return;
    if (typeof v === 'string') {
      characters += v.length;
      if (characters > 102400) throw new RunneeValidationError('Request JSON is too large.');
      return;
    }
    if (typeof v === 'number' && Number.isFinite(v)) return;
    if (
      v &&
      typeof v === 'object' &&
      (Array.isArray(v) ||
        Object.getPrototypeOf(v) === Object.prototype ||
        Object.getPrototypeOf(v) === null)
    ) {
      if (ancestors.has(v)) throw new RunneeValidationError('Request JSON contains a cycle.');
      ancestors.add(v);
      for (const [key, entry] of Object.entries(v)) {
        characters += key.length;
        walk(entry, depth + 1);
      }
      ancestors.delete(v);
      return;
    }
    throw new RunneeValidationError('Request data must contain only JSON values.');
  };
  walk(value);
  const encoded = JSON.stringify(value);
  if (new TextEncoder().encode(encoded).byteLength > 102400)
    throw new RunneeValidationError('Request JSON exceeds 100 KiB.');
  return encoded;
}
