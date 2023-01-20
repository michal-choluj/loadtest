import { EventEmitter } from 'events';
import * as measured from 'measured-core';
import { v4 as uuidv4 } from 'uuid';

export interface IMeter {
  count: number;
  mean: number;
  currentRate: number;
  '1MinuteRate': number;
  '5MinuteRate': number;
  '15MinuteRate': number;
}

export interface IHistogram {
  min: number;
  max: number;
  sum: number;
  mean: number;
  stddev: number;
  count: number;
  median: number;
  p75: number;
  p95: number;
  p99: number;
  p999: number;
}

export interface IMetric {
  id?: string;
  name: string;
  meter: IMeter;
  histogram: IHistogram;
}

export class FlowMetrics extends EventEmitter {
  private uuid = uuidv4();
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

  public getStats(): IMetric[] {
    const stats = this.stats.toJSON();
    return Object.keys(stats).map((key) => {
      return {
        name: key,
        id: this.uuid,
        meter: stats[key].meter,
        histogram: stats[key].histogram,
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
