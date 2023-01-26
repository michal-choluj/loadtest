import { pick } from 'lodash';
import { createWriteStream } from 'node:fs';
import { CsvFormatterStream, format } from '@fast-csv/format';
import {
  ICounter,
  IHistogram,
  IMeter,
  IMetric,
  IMetricReporter,
} from '@pulseio/metric-engine';

/**
 * Lists all possible column types.
 */
export type ColumnType = 'date' | 'name' | 'field' | 'value' | 'type';

/**
 * Lists all possible metrics types.
 */
export type MetricType = 'meter' | 'histogram' | 'counter';

/**
 * Options for {@link CsvReporter}.
 *
 * @export
 * @interface ICsvReporterOptions
 */
export interface ICsvReporterOptions {
  /**
   * The writer used to store the rows.
   *
   * TODO: Implement custom file writer
   * TODO: Add possibility to write CSV to AWS S3 storage
   *
   * @type {CsvFileWriter}
   * @memberof ICsvReporterOptions
   */
  readonly writer?: any; //CsvFileWriter

  /**
   * Indicates that single quotes are used instead of double quotes.
   *
   * @type {boolean}
   * @memberof ICsvReporterOptions
   */
  readonly useSingleQuotes?: boolean;

  /**
   * The columns to export.
   *
   * @type {ColumnType[]}
   * @memberof ICsvReporterOptions
   */
  readonly columns?: ColumnType[];

  /**
   * The metrics to export.
   *
   * @type {MetricType[]}
   * @memberof ICsvReporterOptions
   */
  readonly types?: MetricType[];

  /**
   * The format for the date column.
   *
   * @type {string}
   * @memberof ICsvReporterOptions
   */
  readonly dateFormat?: string;

  /**
   * The timezone used to determine the date.
   *
   * @type {string}
   * @memberof ICsvReporterOptions
   */
  readonly timezone?: string;
}

/**
 * Standard implementation of a {@link IMetricReporter} that uses a {@link Logger} instance.
 *
 * @export
 * @class CsvReporter
 * @extends {CsvMetricReporter}
 */
export class CsvMetricReporter implements IMetricReporter {
  /**
   * This is the main entry point for formatting CSVs.
   * It is used by all other helper methods.
   *
   * @private
   * @type {CsvFormatterStream}
   * @memberof CsvReporter
   */
  private csvStream: CsvFormatterStream<any, any>;

  /**
   * Creates an instance of CsvMetricReporter.
   *
   * @memberof CsvMetricReporter
   */
  public constructor(
    private options: ICsvReporterOptions = {
      columns: ['date', 'name', 'type', 'field', 'value'],
      types: ['meter', 'histogram', 'counter'],
    },
  ) {
    this.csvStream = format({ headers: true });
    this.csvStream.pipe(this.writeStream);
  }

  /**
   * Creates the log message for the given {@link IMetric}
   *
   * @param {IMetric[]} metricsCollection
   * @returns {this}
   * @memberof CsvMetricReporter
   */
  public createReport(metricsCollection: IMetric[]): this {
    for (const metric of metricsCollection) {
      this.writeMetric(metric);
    }
    return this;
  }

  /**
   * Write the given {@link IMetric}
   *
   * @param metric
   * @returns
   * @memberof CsvMetricReporter
   */
  private writeMetric(metric: IMetric) {
    for (const metricType of this.options.types) {
      this.writeRows(metric.name, metricType, metric[metricType]);
    }
  }

  /**
   * Write the all metric rows for the given {@link IMetric}
   *
   * @param metricName
   * @param metricType
   * @param stats
   * @returns
   * @memberof CsvMetricReporter
   */
  private writeRows(
    metricName: string,
    metricType: MetricType,
    stats: IMeter | IHistogram | ICounter,
  ) {
    for (const fieldName in stats) {
      const fieldValue = stats[fieldName];
      const row = this.buildRow(metricName, metricType, fieldName, fieldValue);
      this.csvStream.write(row);
    }
    return this;
  }

  /**
   * Build the single row for the given metric
   *
   * @param metricName
   * @param metricType
   * @param fieldName
   * @param fieldValue
   * @returns
   * @memberof CsvMetricReporter
   */
  private buildRow(
    metricName: string,
    metricType: MetricType,
    fieldName: string,
    fieldValue: any,
  ): Record<string, any> {
    return pick(
      {
        date: Date.now(),
        name: metricName,
        type: metricType,
        field: fieldName,
        value: fieldValue,
      },
      this.options.columns,
    );
  }

  /**
   * The writer used to store the rows.
   *
   * @returns {WriteStream}
   * @memberof CsvMetricReporter
   */
  private get writeStream() {
    return createWriteStream(`${Date.now()}.metrics.csv`);
  }
}
