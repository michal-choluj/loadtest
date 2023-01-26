import { IMetric, IMetricReporter } from '../metric';
import { ILogger } from './logger';

/**
 * Options for {@link LoggerReporter}.
 *
 * @export
 * @interface LoggerReporterOptions
 */
export interface ILoggerReporterOptions {
  /**
   * The logger instance used to report metrics.
   *
   * @type {ILogger}
   * @memberof ILoggerReporterOptions
   */
  logger?: ILogger;
  /**
   * The reporting interval in ms
   *
   * @type {number}
   * @memberof ILoggerReporterOptions
   */
  readonly reportInterval?: number;
}

/**
 * Standard implementation of a {@link IMetricReporter} that uses a {@link Logger} instance.
 *
 * @export
 * @class LoggerReporter
 */
export class LoggerReporter implements IMetricReporter {
  /**
   * The logger instance used to report metrics.
   *
   * @type {Logger}
   * @memberof ILoggerReporterOptions
   */
  private logger: Logger;

  /**
   * Creates an instance of LoggerReporter.
   *
   * @memberof LoggerReporter
   */
  public constructor({ logger = console }: ILoggerReporterOptions = {}) {
    this.logger = logger;
  }

  /**
   * Builds the log message for the given {@link IMetric}
   *
   * @param {IMetric[]} metricsData
   * @returns {this}
   */
  public createReport(metricsData: IMetric[]): this {
    this.logger.info(metricsData);
    return this;
  }
}
