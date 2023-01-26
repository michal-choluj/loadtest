import { EventEmitter } from 'events';
import { IMetricAdapter } from './metric.adapter';
import { ICounterAdapter } from './metric.counter';
import { IMeterAdapter } from './metric.meter';
import { ITimerAdapter } from './metric.timer';

declare interface MetricEvents {
  data: (data: IMetric[]) => void;
}

export interface ICounter {
  count: number;
}

export interface IMeter {
  count: number;
  mean: number;
  currentRate: number;
  '1MinuteRate': number;
  '5MinuteRate': number;
  '15MinuteRate': number;
}

export interface IHistogram {
  min: number;
  max: number;
  sum: number;
  mean: number;
  stddev: number;
  count: number;
  median: number;
  p75: number;
  p95: number;
  p99: number;
  p999: number;
}

export interface IMetric {
  id?: string;
  name: string;
  meter?: IMeter;
  counter?: ICounter;
  histogram?: IHistogram;
}

export interface IMetricEngine {
  /**
   * Gets or creates and registers an implementation of {@link ITimerAdapter}
   *
   * @param {string} name The metric name
   * @return {ITimerAdapter}
   */
  getTimer(name): ITimerAdapter;

  /**
   * Gets or creates and registers an implementation of {@link ICounterAdapter}
   *
   * @param {string} name The metric name
   * @return {ICounterAdapter}
   */
  getCounter(name): ICounterAdapter;

  /**
   * Gets or creates and registers an implementation of {@link IMeterAdapter}
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
   */
  getStats(): IMetric[];

  /**
   * Call the {@link #getStats} function in the interval specified.
   *
   * @emits
   * @returns {void}
   * @memberof IMetricEngine
   */
  start(): void;

  /**
   * Stops reporting metrics
   *
   * @returns {void}
   * @memberof IMetricEngine
   */
  stop(): void;

  /**
   * Adds the listener function
   *
   * @param {String} event
   * @param {Function} listener
   * @returns {this}
   * @memberof IEngine
   */
  on<EventKey extends keyof MetricEvents>(
    event: EventKey,
    listener: MetricEvents[EventKey],
  ): this;

  /**
   * Synchronously calls each of the listeners registered for the event named eventName
   *
   * @param {String} event
   * @param {Function} listener
   * @returns {this}
   * @memberof IEngine
   */
  emit<EventKey extends keyof MetricEvents>(
    event: EventKey,
    ...args: Parameters<MetricEvents[EventKey]>
  ): boolean;
}

/**
 * Metric engine
 * Base-class for metric-engine implementations.
 *
 * @export
 * @abstract
 * @class MetricEngine
 */
export class MetricEngine extends EventEmitter implements IMetricEngine {
  private interval: NodeJS.Timer;
  private adapter: IMetricAdapter;

  constructor(adapter: IMetricAdapter) {
    super();
    this.adapter = adapter;
  }

  public getMeter(name: string): IMeterAdapter {
    return this.adapter.getMeter(name);
  }

  public getTimer(name: string): ITimerAdapter {
    return this.adapter.getTimer(name);
  }

  public getCounter(name: string): ICounterAdapter {
    return this.adapter.getCounter(name);
  }

  public getStats(): IMetric[] {
    return this.adapter.getStats();
  }

  public stop() {
    clearInterval(this.interval);
  }

  /**
   * TODO: Move timer interval as a parameter
   */
  public start() {
    this.stop();
    this.interval = setInterval(() => {
      const stats = this.getStats();
      if (stats) {
        this.emit('data', stats);
      }
    }, 1000);
  }
}
