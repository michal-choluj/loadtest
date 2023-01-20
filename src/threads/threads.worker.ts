import { Scenario } from '../scenarios/scenarios.index';
import { parentPort, workerData } from 'worker_threads';

const postMessage = (event, message) => {
  parentPort.postMessage({ event, message });
};

const scenario = new Scenario(workerData);
scenario.on('metrics', (data) => postMessage('metrics', data));
scenario.on('finished', (data) => postMessage('exit', data));
scenario
  .execute()
  .then(() => console.log('Scenario executed'))
  .catch(console.error); // TODO: error handling
