import { Engine } from '../engine/engine.abstract';
import { FlowMetrics } from './flow.metrics';

export interface FlowOptions {
  type: string;
}

export class FlowRunner {
  constructor(protected engine: Engine, protected metrics: FlowMetrics) {}
}
