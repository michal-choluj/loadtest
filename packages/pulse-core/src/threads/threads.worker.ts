import { parentPort, workerData } from 'worker_threads';
import { MetricAdapter, MetricEngine } from '@pulseio/metric-engine';
import { HttpEngine } from '@pulseio/http-engine';
import { Scenario } from '../core.scenario';

const postMessage = (event, message) => {
  parentPort.postMessage({ event, message });
};

const metricAdapter = new MetricAdapter();
const metricEngine = new MetricEngine(metricAdapter);
const scenario = new Scenario(workerData, metricEngine);
scenario.addEngine('http', HttpEngine);
scenario.on('start', (data) => postMessage('start', data));
scenario.on('data', (data) => postMessage('data', data));
scenario.on('finish', (data) => postMessage('finish', data));
scenario.execute().then(() => postMessage('executed', {}));
