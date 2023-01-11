import { Worker } from 'worker_threads';

export class Pool {
  private workers: Worker[] = [];

  createWorker(options: object): Worker {
    const worker = new Worker(`${__dirname}/threads.worker.js`, {
      workerData: options,
    });
    worker.on('error', (err) => {
      console.error(err);
    });
    this.workers.push(worker);
    return worker;
  }

  postMessage(message: object) {
    this.workers.forEach((worker) => worker.postMessage(message));
  }
}
