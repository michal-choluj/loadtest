import { update } from 'lodash';

export class FlowMetrics {
  protected storage: Record<string, any> = {};

  constructor() {
    // initialize
  }

  public increment(path, value = 1) {
    return update(this.storage, path, (n) => (n ? n + value : 1));
  }

  public start(name) {
    this.increment(`${name}.started`);
  }

  public stop(name) {
    this.increment(`${name}.completed`);
  }

  public aggregate(name) {
    // initialize
  }
}
