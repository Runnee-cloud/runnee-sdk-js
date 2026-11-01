// Shared assertions run on the host's native test runner.
const runtime = typeof Bun === 'undefined' ? await import('node:test') : await import('bun:test');
export const test = runtime.test;
