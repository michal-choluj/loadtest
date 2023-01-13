import { TestSchema } from './schema';
import { Scenario } from './scenarios/scenarios.index';

async function fakeWorker() {
  const scenario = new Scenario(TestSchema.scenarios[0]);
  await scenario.execute();
}

fakeWorker();
