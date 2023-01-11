import { Middleware } from '../flow/flow.pipeline';

export interface Engine {
  createTask(options: object): Middleware;
  createFlow(options: object[]): Middleware[];
}
