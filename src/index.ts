import { TestSchema } from './schema';
import { Scenario } from './scenarios/scenarios.index';

async function bootstrap() {
  for (const options of TestSchema.scenarios) {
    const scenario = new Scenario(options);
    await scenario.execute();
  }
}

bootstrap();
