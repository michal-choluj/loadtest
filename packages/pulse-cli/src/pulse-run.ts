#!/usr/bin/env node

import { cpus } from 'os';
import { cwd } from 'process';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { Command } from 'commander';
import { Pool } from '@pulseio/threads';
import { MetricAggregator } from '@pulseio/metric-engine';
import { LoggerReporter } from '@pulseio/log-reporter';
import { CsvMetricReporter } from '@pulseio/csv-reporter';

const program = new Command();
program
  .option('-p, --path <value>', 'Path to config with scenarios')
  .option('-w, --workers <number>', 'Number of workers', `${cpus().length - 1}`)
  .action(async (options) => {
    const logReporter = new LoggerReporter();
    const csvReporter = new CsvMetricReporter();
    const aggregator = new MetricAggregator();
    aggregator.addMetricReporter(csvReporter);
    aggregator.addMetricReporter(logReporter);
    const poll = new Pool({
      metricAggregator: aggregator,
      size: Number(options.workers),
    });
    const scenario = resolve(join(cwd(), options.path));
    const data = await readJsonFile(scenario);
    await poll.execute(data.scenarios.pop());
  })
  .parse(process.argv);

async function readJsonFile(path) {
  const file = await readFile(path);
  return JSON.parse(file.toString());
}
