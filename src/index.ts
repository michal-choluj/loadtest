import { MetricAggregator } from './metric/metric.aggregator';
import { LoggerReporter } from './reporter/reporter';
import { TestSchema } from './schema';
import { Pool } from './threads/threads.pool';

(async () => {
  const logger = new LoggerReporter();
  const aggregator = new MetricAggregator();
  const scenario = TestSchema.scenarios.pop();

  aggregator.addMetricReporter(logger);

  const poll = new Pool({
    metricAggregator: aggregator,
    size: 2,
  });

  await poll.execute(scenario);
})();
