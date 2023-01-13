import { Engine } from '../engine/engine.interface';
import { FlowMetrics } from './flow.metrics';
import { FlowContext } from './flow.context';

export interface FlowOptions {
  type: string;
}

export class FlowRunner {
  constructor(
    protected engine: Engine,
    protected metrics: FlowMetrics = new FlowMetrics(),
  ) {}

  async execute(): Promise<void> {
    const maxVirtualUsers = this.engine.maxVirtualUsers;
    const maxUsersPerSec = this.engine.connectionsPerSecond;
    for (let index = 0; index < maxVirtualUsers; index++) {
      this.metrics.start('flow');
      this.engine
        .execute(new FlowContext(this.metrics))
        .then(() => console.log('VirtualUser ' + index))
        .finally(() => this.metrics.stop('flow'));
      await this.sleep(maxUsersPerSec);
    }
  }

  sleep(maxUsersPerSec: number): Promise<void> {
    const delay = Math.floor(1000 / maxUsersPerSec);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
