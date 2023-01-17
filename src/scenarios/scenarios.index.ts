import { EventEmitter } from 'events';
import { EngineFactory, EngineOptions } from '../engine/engine.index';
import { FlowContext, FlowMetrics, FlowOptions } from '../flow/flow.index';
import { Engine } from '../engine/engine.interface';

export interface ScenarioOptions {
  config: EngineOptions;
  flow: FlowOptions[];
}

declare interface IScenarioEvents {
  metrics: () => void;
  finished: () => void;
}

export declare interface IScenario {
  execute(): Promise<void>;
  on<K extends keyof IScenarioEvents>(
    event: K,
    listener: IScenarioEvents[K],
  ): this;
  emit<K extends keyof IScenarioEvents>(
    event: K,
    ...args: Parameters<IScenarioEvents[K]>
  ): boolean;
}

export class Scenario extends EventEmitter implements IScenario {
  protected config: EngineOptions;
  protected flow: FlowOptions[];
  protected metrics: FlowMetrics;
  protected engine: Engine;

  public constructor(protected options: ScenarioOptions) {
    super();
    this.flow = options.flow;
    this.config = options.config;
    this.metrics = new FlowMetrics();
    this.engine = EngineFactory.create(this.config.engine, this.options);
    this.engine.on('finished', this.terminate.bind(this));
    this.metrics.on('stats', this.emitMetrics.bind(this));
  }

  public async execute() {
    const maxVirtualUsers = this.engine.maxVirtualUsers;
    const maxUsersPerSec = this.engine.connectionsPerSecond;
    for (let index = 0; index < maxVirtualUsers; index++) {
      await this.createUser(maxUsersPerSec);
    }
  }

  private async createUser(maxUsersPerSec) {
    const timer = this.metrics.timer('flow');
    this.engine
      .execute(new FlowContext(this.metrics))
      .catch(console.error)
      .finally(() => timer.end());
    return this.sleep(maxUsersPerSec);
  }

  private terminate() {
    this.emit('finished', this.metrics.getStats());
    this.metrics.terminate();
  }

  private emitMetrics(data) {
    this.emit('metrics', data);
  }

  private sleep(maxUsersPerSec: number): Promise<void> {
    const delay = Math.floor(1000 / maxUsersPerSec);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
