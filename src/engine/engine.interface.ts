import { Middleware } from '../flow/flow.pipeline';

export interface Engine {
  isTaskSupported(type: string): boolean;
  createTask(options: object): Middleware;
  createFlow(options: object[]): Middleware[];
}
