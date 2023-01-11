import { Engine, SocketEngine } from './engine.socket';

export interface EngineOptions {
  target: string;
  engine: string;
}

export class EngineFactory {
  protected options: EngineOptions;
  constructor(options: EngineOptions) {
    this.options = options;
  }

  create(): Engine {
    switch (this.options.engine) {
      case 'socket.io':
        return new SocketEngine(this.options);
      default:
        throw new Error(`Engine ${this.options.engine} is not supported`);
    }
  }
}
