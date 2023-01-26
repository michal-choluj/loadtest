import { IMetric } from './metric.core';

export interface IMetricReporter {
  /**
   * Builds the log message for the given {@link IMetric}
   *
   * @param {IMetric[]} metricsData
   * @returns {this}
   */
  createReport(metricsData: IMetric[]): this;
}
