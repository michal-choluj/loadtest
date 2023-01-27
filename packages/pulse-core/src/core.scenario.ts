import { EventEmitter } from 'events';
import { IEngine } from './index';
import { IMetric, IMetricEngine } from '@pulseio/metric-engine';

export interface ConfigOptions {
  maxRateLimit: number;
  maxVirtualUsers: number;
  target: string;
  engine: string;
}

export interface FlowOptions {
  type: string;
}

export interface IScenarioOptions {
  config: ConfigOptions;
  flow: FlowOptions[];
}

interface IEngineConstructor {
  new (options: IScenarioOptions): IEngine;
}

interface IEngineStrategy {
  name: string;
  engine: IEngineConstructor;
}

declare interface IScenarioEvents {
  start: (data: IMetric[]) => void;
  data: (data: IMetric[]) => void;
  finish: (data: IMetric[]) => void;
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
  protected config: ConfigOptions;
  protected flow: FlowOptions[];
  protected engines: IEngineStrategy[] = [];

  public constructor(
    private options: IScenarioOptions,
    private metric: IMetricEngine,
  ) {
    super();
    this.flow = options.flow;
    this.config = options.config;
    this.metric.on('data', (data) => this.data(data));
  }

  public async execute() {
    const engine = this.createEngine();
    engine.on('start', () => this.start());
    engine.on('finish', () => this.stop());
    engine.setMetricClient(this.metric);
    return engine.execute();
  }

  public addEngine(name: string, engine: IEngineConstructor): void {
    this.engines.push({ name: name, engine: engine });
  }

  public getEngine(name: string): IEngineStrategy {
    return this.engines.find(
      (strategy): strategy is typeof strategy => strategy.name === name,
    );
  }

  private createEngine(): IEngine {
    const { engine: Engine } = this.getEngine(this.config.engine);
    return new Engine(this.options);
  }

  private stop() {
    setTimeout(() => {
      this.emit('finish', this.metric.getStats());
      this.metric.stop();
    }, 1000);
  }

  private start() {
    this.emit('start', this.metric.getStats());
    this.metric.start();
  }

  private data(data: IMetric[]) {
    this.emit('data', data);
  }
}
