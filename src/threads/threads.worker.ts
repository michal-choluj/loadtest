import { Scenario } from '../scenarios/scenarios.index';
import { parentPort, workerData } from 'worker_threads';
import { MetricAdapter } from '../metric/metric.adapter';
import { MetricEngine } from '../metric/metric.core';
import { HttpEngine } from '../http-engine/http.engine';
import { SocketEngine } from '../socket-engine/engine.socket';

const postMessage = (event, message) => {
  parentPort.postMessage({ event, message });
};

const metricAdapter = new MetricAdapter();
const metricEngine = new MetricEngine(metricAdapter);
const scenario = new Scenario(workerData, metricEngine);
scenario.addEngine('http', HttpEngine);
scenario.addEngine('socket', SocketEngine);
scenario.on('start', (data) => postMessage('start', data));
scenario.on('data', (data) => postMessage('data', data));
scenario.on('finish', (data) => postMessage('finish', data));
scenario.execute().then(() => postMessage('executed', {}));
