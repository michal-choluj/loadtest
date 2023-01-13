import { EngineFactory, EngineOptions } from '../engine/engine.index';
import { FlowMetrics, FlowOptions, FlowRunner } from '../flow/flow.index';

export interface ScenarioOptions {
  config: EngineOptions;
  flow: FlowOptions[];
}

export class Scenario {
  protected config: EngineOptions;
  protected flow: FlowOptions[];
  protected plugins: [] = [];

  public constructor(protected options: ScenarioOptions, plugins: [] = []) {
    this.config = options.config;
    this.flow = options.flow;
    this.plugins = plugins;
  }

  public async execute() {
    const metrics = new FlowMetrics();
    const engine = EngineFactory.create(this.config.engine, this.options);
    const flow = new FlowRunner(engine, metrics);
    await flow.execute();
  }
}
