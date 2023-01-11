import { Engine } from '../engine/engine.interface';
import { FlowContext } from './flow.context';
import { FlowPipeline } from './flow.pipeline';

export interface FlowOptions {
  type: string;
}

export class Flow {
  protected engine: Engine;
  protected options: FlowOptions[];

  constructor(engine: Engine, options: FlowOptions[]) {
    this.options = options;
    this.engine = engine;
  }

  async execute(): Promise<void> {
    const pipeline = new FlowPipeline();
    const middleware = this.engine.createFlow(this.options);
    pipeline.use(middleware);
    for (let index = 0; index < 100; index++) {
      const context = new FlowContext();
      pipeline.execute(context);
    }
  }
}
