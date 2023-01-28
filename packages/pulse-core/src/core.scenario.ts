import { EventEmitter } from 'events';
import { IEngine } from './index';
import { IMetric, IMetricEngine } from '@pulseio/metric-engine';
import { ScenarioOptionsDto, IScenarioOptions } from './core.scenarioDto';

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
  execute(options: IScenarioOptions): Promise<void>;
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
  protected engines: IEngineStrategy[] = [];

  public constructor(private metric: IMetricEngine) {
    super();
    this.metric.on('data', (data) => this.data(data));
  }

  public async execute(opts: IScenarioOptions) {
    const scenario = new ScenarioOptionsDto(opts).validate();
    const engine = this.createEngine(scenario);
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

  private createEngine(opts: ScenarioOptionsDto): IEngine {
    const strategy = this.getEngine(opts.engineName);
    if (!strategy) {
      throw new Error(`Could not find engine ${opts.engine}`);
    }
    return new strategy.engine(opts);
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
