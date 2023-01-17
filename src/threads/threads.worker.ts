import { Scenario } from '../scenarios/scenarios.index';
import { parentPort, workerData } from 'worker_threads';

const scenario = new Scenario(workerData);
scenario.on('metrics', (data) => {
  // console.log('metrics', data);
  parentPort.postMessage(data);
});

scenario.on('finished', (data) => {
  parentPort.postMessage(data);
  // console.log('finished', data);
});

scenario
  .execute()
  .then(() => console.log('Scenario executed'))
  .catch(console.error);
