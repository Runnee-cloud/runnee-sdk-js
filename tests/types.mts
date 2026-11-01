import { Runnee, type ExecuteResponse, type Secret, RunneeError } from '../lib/esm/index.js';
const client = new Runnee({ apiKey: 'rne_types_fixture' });
const result: ExecuteResponse = await client.execute({
  code: 'function main(){return 30;}',
  secretNames: ['API_KEY'],
});
if (result.executionResult) console.log(result.executionResult.returnValue);
const secret: Secret = await client.secrets.create({
  name: 'API_KEY',
  value: 'fixture-secret',
  allowInline: true,
});
console.log(secret.name);
// @ts-expect-error Stored secret values are never exposed by the response type.
console.log(secret.value);
// @ts-expect-error Client timeout options must be numeric.
new Runnee({ timeout: '30' });
// @ts-expect-error Saved script updates require optimistic version matching.
await client.scripts.update('id', { name: 'Order', code: 'function main(){}' });
// @ts-expect-error API-key issuance is intentionally absent.
await client.apiKeys.create({ name: 'not-supported' });
try {
  await client.usage.history(30);
} catch (error) {
  if (error instanceof RunneeError) console.log(error.requestId);
}

const explicit = new Runnee('rne_types_fixture', { timeout: 30000 });
void explicit;
// @ts-expect-error API key must be a string.
new Runnee(123);
