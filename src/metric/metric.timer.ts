export interface ITimer {
  start(): IStopWatch;
}

export interface IStopWatch {
  stop(): void;
}

export class StopWatchAdapter implements IStopWatch {
  constructor(private stopWatch: any) {}
  stop() {
    this.stopWatch.end();
  }
}

export class Timer implements ITimer {
  constructor(private service) {}
  start(): IStopWatch {
    const timer = this.service.start();
    return new StopWatchAdapter(timer);
  }
}
