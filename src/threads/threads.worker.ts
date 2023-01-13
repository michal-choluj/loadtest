import { Scenario } from '../scenarios/scenarios.index';
import { workerData } from 'worker_threads';

const scenario = new Scenario(workerData);
scenario.execute().then(() => console.log('DONE'));
