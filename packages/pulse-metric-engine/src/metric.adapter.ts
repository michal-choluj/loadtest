import { Collection, MetricTypes } from 'measured-core';
import { randomBytes } from 'node:crypto';
import { ICounterAdapter, CounterAdapter } from './metric.counter';
import { ITimerAdapter, TimerAdapter } from './metric.timer';
import { IMeterAdapter, MeterAdapter } from './metric.meter';
import { IMetric } from './metric.core';

/**
 * Default metric adapter interface for the measured-core library
 *
 * @memberof IMetricAdapter
 */
export interface IMetricAdapter {
  /**
   * Gets or creates and registers a {@link Timer}
   *
   * @param {string} name The metric name
   * @return {ITimer}
   * @memberof IMetricAdapter
   */
  getTimer(name: string): ITimerAdapter;

  /**
   * Gets or creates and registers a {@link Counter}
   *
   * @param {string} name The metric name
   * @return {ICounter}
   * @memberof IMetricAdapter
   */
  getCounter(name: string): ICounterAdapter;

  /**
   * Gets or creates and registers a {@link IMeterAdapter}
   *
   * @param {string} name The metric name
   * @return {IMeterAdapter}
   * @memberof IMetricAdapter
   */
  getMeter(name: string): IMeterAdapter;

  /**
   * Fetches the data/values from all registered metrics
   *
   * @return {IMetric[]} The combined array of registered metrics
   * @memberof IMetricAdapter
   */
  getStats(): IMetric[];
}

/**
 * Default metric adapter for the measured-core library {@see https://www.npmjs.com/package/measured-core}
 * The {@link MetricAdapter} makes the measured-core interface compatible with the MetricEngine interface.
 */
export class MetricAdapter extends Collection implements IMetricAdapter {
  [x: string]: any;

  private uuid: string = this.getUuid();

  public getMeter(name: string): IMeterAdapter {
    const meter = this.meter(name);
    return new MeterAdapter(meter);
  }

  public getTimer(name: string): ITimerAdapter {
    const timer = this.timer(name);
    return new TimerAdapter(timer);
  }

  public getCounter(name: string): ICounterAdapter {
    return new CounterAdapter(this.counter(name));
  }

  /**
   * Fetches the data/values from all registered metrics
   *
   * @override
   * @return {Object} The combined JSON object
   * @memberof MetricAdapter
   */
  public getStats(): IMetric[] {
    return Object.keys(this._metrics).map((key) => {
      return {
        name: key,
        id: this.uuid,
        date: Date.now(),
        ...this.getMetric(key),
      };
    });
  }

  /**
   * Generates random string
   *
   * @returns {String} Random string
   * @memberof MetricAdapter
   */
  private getUuid(): string {
    return randomBytes(20).toString('hex');
  }

  /**
   * Get metric by name and unify output format
   *
   * @param {String} name
   * @returns {Object} Metric object
   * @memberof MetricAdapter
   */
  private getMetric(name: string): object {
    const metricType = this._metrics[name].getType();
    switch (metricType) {
      case MetricTypes.TIMER:
        return this._metrics[name].toJSON();
      case MetricTypes.COUNTER:
        return {
          [metricType.toLowerCase()]: {
            count: this._metrics[name].toJSON(),
          },
        };
      default:
        return {
          [metricType.toLowerCase()]: this._metrics[name].toJSON(),
        };
    }
  }
}
