import { Runnee } from '@runnee/sdk';
const client = new Runnee(process.env.RUNNEE_API_KEY);
const result = await client.execute({ code: 'function main(){return 10+20;}', mode: 'dry-run' });
console.log(result);
