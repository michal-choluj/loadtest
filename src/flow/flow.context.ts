import * as jsonpath from 'jsonpath';
import { get, set } from 'lodash';
import { FlowMetrics } from './flow.metrics';

export class FlowContext {
  private storage: Record<string, any> = {};
  public metrics: FlowMetrics;

  constructor(metrics: FlowMetrics) {
    this.metrics = metrics;
  }

  set(namespace: string, value: any): Record<string, any> {
    return set(this.storage, namespace, value);
  }

  get(namespace) {
    return get(this.storage, namespace);
  }

  jsonValue(path) {
    return jsonpath.value(this.storage, path);
  }
}
