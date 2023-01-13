import { FlowContext } from '../flow/flow.context';

export interface Engine {
  get maxVirtualUsers(): number;
  get connectionsPerSecond(): number;
  execute(context: FlowContext): Promise<void>;
}
