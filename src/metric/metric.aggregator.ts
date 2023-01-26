import { chain } from 'lodash';
import {
  ICounter,
  IHistogram,
  IMeter,
  IMetric,
  IMetricReporter,
} from '../metric';

export interface IMetricAggregator {
  get: () => IMetric[];
  start: () => this;
  stop: () => this;
  update: (data: IMetric[]) => this;
}

export class MetricAggregator implements IMetricAggregator {
  /**
   * Storage for aggregated data
   *
   * @private
   * @type {Array<IMetric>}
   * @memberof MetricAggregator
   */
  private storage: IMetric[] = [];

  /**
   * Reporters instances
   *
   * @memberof MetricAggregator
   */
  private reporters: IMetricReporter[] = [];

  /**
   * Timer instance returned by the scheduler function.
   *
   * @private
   * @type {NodeJS.Timer}
   * @memberof MetricAggregator
   */
  private timer: NodeJS.Timer;

  public get(): IMetric[] {
    const metrics = [...new Set(this.storage.map((item) => item.name))];
    return metrics.map((name) => this.getByName(name));
  }

  /**
   * Get a metric by name
   *
   * @param {String} name
   * @returns {IMetric}
   * @memberof MetricAggregator
   */
  public getByName(name: string): IMetric {
    return {
      name,
      meter: this.has(name, 'meter') ? this.meter(name) : undefined,
      histogram: this.has(name, 'histogram') ? this.histogram(name) : undefined,
      counter: this.has(name, 'counter') ? this.counter(name) : undefined,
    };
  }

  /**
   * Update aggregated metrics
   *
   * @param {IMetric[]} data
   * @returns {Promise<this>}
   * @memberof MetricAggregator
   */
  public update(data: IMetric[]): this {
    for (const item of data) {
      const idx: number = this.storage.findIndex(
        (e) => e.id === item.id && e.name === item.name,
      );
      if (idx > -1) {
        this.storage[idx] = item;
      } else {
        this.storage.push(item);
      }
    }
    return this;
  }

  /**
   * Starts reporting metrics.
   *
   * @returns {this}
   * @memberof MetricAggregator
   */
  public start(): this {
    if (!this.timer) {
      this.timer = setInterval(() => this.createReport(), 1000);
    }
    return this;
  }

  /**
   * Stops reporting metrics.
   *
   * @returns {this}
   * @memberof MetricAggregator
   */
  public stop(): this {
    if (this.timer) {
      this.timer.unref();
    }
    return this;
  }

  /**
   * Adds a new {@link MetricReporter} to create report
   *
   * @param {MetricReporter} metricReporter
   * @returns {this}
   * @memberof MetricAggregator
   */
  public addMetricReporter(metricReporter): this {
    this.reporters.push(metricReporter);
    return this;
  }

  /**
   * Builds the logs using the given reporters
   *
   * @returns {this}
   * @memberof MetricAggregator
   */
  public createReport(): this {
    for (const reporter of this.reporters) {
      const metrics = this.get();
      reporter.createReport(metrics);
    }
    return this;
  }

  /**
   * Aggregate data that things that increment or decrement
   *
   * @param {String} name
   * @returns {IMeter}
   * @memberof MetricAggregator
   */
  private counter(name: string): ICounter {
    return {
      count: this.sum(name, 'counter.count'),
    };
  }

  /**
   * Aggregate data that are measured as events / interval.
   *
   * @param {String} name
   * @returns {IMeter}
   * @memberof MetricAggregator
   */
  private meter(name: string): IMeter {
    return {
      count: this.sum(name, 'meter.count'),
      mean: this.sum(name, 'meter.mean'),
      currentRate: this.sum(name, 'meter.currentRate'),
      '1MinuteRate': this.sum(name, 'meter.1MinuteRate'),
      '5MinuteRate': this.sum(name, 'meter.5MinuteRate'),
      '15MinuteRate': this.sum(name, 'meter.15MinuteRate'),
    };
  }

  /**
   * Aggregate a reservoir of statistically relevant values biased
   * towards the last n minutes to explore their distribution.
   *
   * @param {String} name
   * @returns {IHistogram}
   * @memberof MetricAggregator
   */
  private histogram(name: string): IHistogram {
    return {
      min: this.mean(name, 'histogram.min'),
      max: this.mean(name, 'histogram.max'),
      sum: this.mean(name, 'histogram.sum'),
      mean: this.mean(name, 'histogram.mean'),
      stddev: this.mean(name, 'histogram.stddev'),
      count: this.sum(name, 'histogram.count'),
      median: this.mean(name, 'histogram.median'),
      p75: this.mean(name, 'histogram.p75'),
      p95: this.mean(name, 'histogram.p95'),
      p99: this.mean(name, 'histogram.p99'),
      p999: this.mean(name, 'histogram.p999'),
    };
  }

  private has(name: string, type: string) {
    return this.storage.find((s) => s.name === name && s[type]);
  }

  /**
   * Computes the mean of the provided properties of the objects for the selected metrics
   *
   * @param {String} name Metric name
   * @param {String} path Metric path in json
   * @returns {Number}
   * @memberof MetricAggregator
   */
  private mean(name: string, path: string): number {
    const params = this.split(path);
    return chain(this.storage)
      .filter((s) => s.name === name)
      .flatMap(params.path)
      .meanBy((o) => +o[params.key])
      .value();
  }

  /**
   * This method is invoked for each element in the selected metrics
   * to generate the value to be summed.
   *
   * @param {String} name Metric name
   * @param {String} path Metric path in json
   * @returns {Number}
   * @memberof MetricAggregator
   */
  private sum(name: string, path: string): number {
    const params = this.split(path);
    return chain(this.storage)
      .filter((s) => s.name === name)
      .flatMap(params.path)
      .sumBy((o) => +o[params.key])
      .value();
  }

  private split(path: string): {
    key: string;
    path: string;
  } {
    const parts = path.split('.');
    return {
      key: parts.pop(),
      path: parts.join('.'),
    };
  }
}
