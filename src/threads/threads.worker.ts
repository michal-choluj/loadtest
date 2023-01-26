import { parentPort, workerData } from 'worker_threads';
import { Scenario } from '../core';
import { MetricAdapter, MetricEngine } from '../metric';
import { SocketEngine } from '../socket-engine';
import { HttpEngine } from '../http-engine';

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
