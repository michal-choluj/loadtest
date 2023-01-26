export interface ITimerAdapter {
  start(): IStopWatchAdapter;
}

export interface IStopWatchAdapter {
  stop(): void;
}

export class StopWatchAdapter implements IStopWatchAdapter {
  constructor(private stopWatch: any) {}
  stop() {
    this.stopWatch.end();
  }
}

export class TimerAdapter implements ITimerAdapter {
  constructor(private service) {}
  start(): IStopWatchAdapter {
    const timer = this.service.start();
    return new StopWatchAdapter(timer);
  }
}
