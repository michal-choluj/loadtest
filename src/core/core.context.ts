import { template } from 'lodash';
import * as jsonpath from 'jsonpath';
import { get, set } from 'lodash';
import { IMetricEngine } from '../metric/metric.core';

export interface IContext {
  readonly metrics: IMetricEngine;
  set(namespace: string, value: any): void;
  get(namespace: string): any;
  jsonValue(path: string): any;
}

export class Context implements IContext {
  private storage: Record<string, any> = {};
  public readonly metrics: IMetricEngine;

  constructor(metrics: IMetricEngine) {
    this.metrics = metrics;
  }

  public set(namespace: string, value: any): Record<string, any> {
    return set(this.storage, namespace, value);
  }

  public get(namespace: string) {
    return get(this.storage, namespace);
  }

  public jsonValue(path: string) {
    return jsonpath.value(this.storage, path);
  }

  public template(templateString: string) {
    return template(templateString)(this.storage);
  }
}
