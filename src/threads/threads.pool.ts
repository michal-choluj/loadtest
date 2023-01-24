import { Worker } from 'worker_threads';
import { IMetricAggregator } from '../metric/metric.aggregator';
import { NodeWorkerSettings } from './threads.types';

export type DataHandler = (data: any) => void;

export type PoolOptions<TWorkerData = any> = NodeWorkerSettings & {
  // number of workers
  size: number;
  // data to pass into workers
  workerData?: TWorkerData;
  // function to handle workers data
  dataHandler?: DataHandler;
  // instance of metrics aggregator
  metricAggregator: IMetricAggregator;
};

export class Pool<TWorkerData = any> {
  private size: number;
  private workers: Worker[] = [];
  private workerScript = `${__dirname}/threads.worker.js`;

  private metricAggregator: IMetricAggregator;

  constructor(options: PoolOptions<TWorkerData>) {
    if (typeof options.size !== 'number') {
      throw new TypeError('"size" must be the type of number');
    }

    if (Number.isNaN(options.size)) {
      throw new Error('"size" must not be NaN');
    }

    if (options.size < 1) {
      throw new RangeError('"size" must not be lower than 1');
    }

    this.size = options.size;
    this.metricAggregator = options.metricAggregator;
  }

  public async execute(config): Promise<number[]> {
    const tasks = [];
    for (let index = 0; index < this.size; index++) {
      tasks.push(this.createWorker(config));
    }
    return Promise.all(tasks);
  }

  public async terminate(): Promise<number[]> {
    const tasks = this.workers.map((worker) => worker.terminate());
    this.workers = [];
    return Promise.all(tasks);
  }

  private createWorker(workerData: TWorkerData): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerScript, {
        workerData,
      });
      this.workers.push(worker);
      worker.on('message', (data) => this.handle(data, resolve));
      worker.on('error', reject);
      worker.on('exit', resolve);
    });
  }

  private handle({ event, message }, next) {
    switch (event) {
      case 'data':
        this.metricAggregator.start();
        this.metricAggregator.update(message);
        return;
      case 'finish':
        this.metricAggregator.stop();
        this.metricAggregator.update(message);
        return next();
    }
  }
}
