import { EventEmitter } from 'events';
import { IMetricAdapter } from './metric.adapter';
import { ICounter } from './metric.counter';
import { ITimer } from './metric.timer';

declare interface MetricEvents {
  data: (data: IMetric[]) => void;
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
  meter: IMeter;
  histogram: IHistogram;
}

export interface IMetricEngine {
  /**
   * Gets or creates and registers a {@link Timer}
   *
   * @param {string} name The metric name
   * @return {ITimer}
   */
  getTimer(name): ITimer;

  /**
   * Gets or creates and registers a {@link Counter}
   *
   * @param {string} name The metric name
   * @return {ICounter}
   */
  getCounter(name): ICounter;

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

  public getTimer(name: string): ITimer {
    return this.adapter.getTimer(name);
  }

  public getCounter(name: string): ICounter {
    return this.adapter.getCounter(name);
  }

  public getStats(): IMetric[] {
    return this.adapter.getStats();
  }

  public stop() {
    clearInterval(this.interval);
  }

  public start() {
    this.stop();
    this.interval = setInterval(() => {
      const stats = this.getStats();
      if (stats) {
        this.emit('data', this.getStats());
      }
    }, 1000);
  }
}
