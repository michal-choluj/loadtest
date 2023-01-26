import { MetricAggregator } from './metric/metric.aggregator';
import { Pool } from './threads/threads.pool';
import { HttpScenario } from './http.scenario';
import { LoggerReporter } from './reporter-log/reporter.log';
import { CsvMetricReporter } from './reporter-csv/reporter.csv';

(async () => {
  const scenario = HttpScenario.scenarios.pop();
  const logReporter = new LoggerReporter();
  const csvReporter = new CsvMetricReporter();
  const aggregator = new MetricAggregator();
  aggregator.addMetricReporter(csvReporter);
  aggregator.addMetricReporter(logReporter);
  const poll = new Pool({
    metricAggregator: aggregator,
    size: 4,
  });
  await poll.execute(scenario);
})();
