import * as measured from 'measured-core';
import { randomBytes } from 'node:crypto';
import { IMetric } from '../flow/flow.index';
import { ICounter, Counter } from './metric.counter';
import { ITimer, Timer } from './metric.timer';

export interface IMetricAdapter {
  /**
   * Gets or creates and registers a {@link Timer}
   *
   * @param {string} name The metric name
   * @return {ITimer}
   */
  getTimer(name: string): ITimer;

  /**
   * Gets or creates and registers a {@link Counter}
   *
   * @param {string} name The metric name
   * @return {ICounter}
   */
  getCounter(name: string): ICounter;

  /**
   * Fetches the data/values from all registered metrics
   *
   * @return {IMetric[]} The combined array of registered metrics
   */
  getStats(): IMetric[];
}

/**
 * The {@link MetricAdapter} makes the measured-core interface compatible with the MetricEngine interface.
 */
export class MetricAdapter implements MetricAdapter {
  private uuid: string = this.getUuid();
  private stats: Record<string, any> = {};

  constructor() {
    this.stats = measured.createCollection();
  }

  public getTimer(name: string): ITimer {
    const timer = this.stats.timer(name);
    return new Timer(timer);
  }

  public getCounter(name: string): ICounter {
    return new Counter(this.stats.counter(name));
  }

  public getStats(): IMetric[] {
    const stats = this.stats.toJSON();
    return Object.keys(stats).map((key) => {
      return {
        name: key,
        id: this.uuid,
        meter: stats[key].meter,
        histogram: stats[key].histogram,
      };
    });
  }

  private getUuid(): string {
    return randomBytes(20).toString('hex');
  }
}
