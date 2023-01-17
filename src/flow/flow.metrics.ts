import { EventEmitter } from 'events';
import * as measured from 'measured-core';

export class FlowMetrics extends EventEmitter {
  protected stats: Record<string, any> = {};
  protected interval: NodeJS.Timer;

  constructor() {
    super();
    this.stats = measured.createCollection();
    this.setInterval();
  }

  public timer(name: string) {
    const timer = this.stats.timer(name);
    return timer.start();
  }

  public getStats() {
    const stats = this.stats.toJSON();
    return Object.keys(stats).map((key) => {
      return {
        id: process.pid,
        name: key,
        stats: stats[key],
      };
    });
  }

  public terminate() {
    this.stats = {};
    clearInterval(this.interval);
  }

  private setInterval() {
    this.interval = setInterval(() => {
      const stats = this.getStats();
      if (stats) {
        this.emit('stats', this.getStats());
      }
    }, 1000);
  }
}
