import { ScenarioOptions } from '../scenarios/scenarios.index';
import { Engine, SocketEngine } from './engine.socket';

export interface EngineOptions {
  target: string;
  engine: string;
}

export class EngineFactory {
  static create(name: string, options: ScenarioOptions): Engine {
    switch (name) {
      case 'socketio':
      case 'socket.io':
        return new SocketEngine(options);
      default:
        throw new Error(`Engine ${name} is not supported`);
    }
  }
}
