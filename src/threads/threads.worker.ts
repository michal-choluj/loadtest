import { Scenario, ProjectOptions } from '../scenarios/scenarios.index';
import { workerData } from 'worker_threads';

const data: ProjectOptions = workerData;
const scenario = new Scenario(data);
scenario.run().then(() => console.log('DONE'));
