import { EngineFactory, EngineOptions } from '../engine/engine.index';
import { Flow, FlowOptions } from '../flow/flow.index';

export interface ScenarioOptions {
  config: EngineOptions;
  flow: FlowOptions[];
}

export class Scenario {
  protected config: EngineOptions;
  protected flow: FlowOptions[];

  public constructor(options: ScenarioOptions) {
    this.config = options.config;
    this.flow = options.flow;
  }

  public async execute() {
    const factory = new EngineFactory(this.config);
    const flow = new Flow(factory.create(), this.flow);
    return flow.execute();
  }
}
