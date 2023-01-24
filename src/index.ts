import { MetricAggregator } from './metric/metric.aggregator';
import { Pool } from './threads/threads.pool';
import { HttpScenario } from './http.scenario';
import { CsvMetricReporter } from './reporter/reporter.csv';
import { LoggerReporter } from './reporter/reporter.logger';

(async () => {
  const logReporter = new LoggerReporter();
  const csvReporter = new CsvMetricReporter();

  const aggregator = new MetricAggregator();
  const scenario = HttpScenario.scenarios.pop();

  aggregator.addMetricReporter(csvReporter);
  aggregator.addMetricReporter(logReporter);

  const poll = new Pool({
    metricAggregator: aggregator,
    size: 1,
  });

  await poll.execute(scenario);
})();
