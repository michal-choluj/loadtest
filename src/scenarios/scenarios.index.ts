import { EventEmitter } from 'events';
import { EngineOptions } from '../engine/engine.index';
import { FlowOptions } from '../flow/flow.index';
import { IEngine } from '../engine/engine.abstract';
import { IMetric, IMetricEngine } from '../metric/metric.core';

export interface ScenarioOptions {
  config: EngineOptions;
  flow: FlowOptions[];
}

interface IEngineConstructor {
  new (options: ScenarioOptions): IEngine;
}

interface Strategy {
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
  protected config: EngineOptions;
  protected flow: FlowOptions[];
  protected engine: IEngine;
  public strategies: Strategy[] = [];

  public constructor(
    private options: ScenarioOptions,
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
    this.strategies.push({ name: name, engine: engine });
  }

  public getEngine(name: string): Strategy {
    return this.strategies.find(
      (strategy): strategy is typeof strategy => strategy.name === name,
    );
  }

  private createEngine(): IEngine {
    const { engine: Engine } = this.getEngine(this.config.engine);
    return new Engine(this.options);
  }

  private stop() {
    this.emit('finish', this.metric.getStats());
    this.metric.stop();
  }

  private start() {
    this.emit('start', this.metric.getStats());
    this.metric.start();
  }

  private data(data: IMetric[]) {
    this.emit('data', data);
  }
}
