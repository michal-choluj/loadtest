import { EventEmitter } from 'events';
import { cpus } from 'os';
import { Worker } from 'worker_threads';
import { NodeWorkerSettings } from './threads.types';

export type PoolOptions<TWorkerData = any> = NodeWorkerSettings & {
  /** number of workers */
  size: number;
  /** data to pass into workers */
  workerData?: TWorkerData;
};

export class Pool<TWorkerData = any> extends EventEmitter {
  private size: number = cpus().length - 1;
  private workerScript = `${__dirname}/threads.worker.js`;

  constructor(options: PoolOptions<TWorkerData>) {
    super();

    if (typeof options.size !== 'number') {
      throw new TypeError('"size" must be the type of number');
    }

    if (Number.isNaN(options.size)) {
      throw new Error('"size" must not be NaN');
    }

    if (options.size < 0) {
      throw new RangeError('"size" must not be lower than 0');
    }

    this.size = options.size;
  }

  public exec(config): Promise<any[]> {
    const tasks = [];
    for (let index = 0; index < this.size; index++) {
      tasks.push(this.createWorker(config));
    }
    return Promise.all(tasks);
  }

  private createWorker(workerData: TWorkerData): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerScript, {
        workerData,
      });
      worker.on('message', (data) => this.emitMessage(data, worker.threadId));
      worker.on('error', reject);
      worker.on('exit', resolve);
    });
  }

  private emitMessage(data, threadId) {
    this.emit('metrics', data, threadId);
  }
}
