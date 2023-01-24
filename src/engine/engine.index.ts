import { HttpEngine } from '../http-engine/http.engine';
import { ScenarioOptions } from '../scenarios/scenarios.index';
import { Engine, SocketEngine } from './engine.socket';

export interface EngineOptions {
  /**
   * A rate limit is the number of API calls an app can make within a given time period
   */
  maxRateLimit: number;
  maxVirtualUsers: number;
  target: string;
  engine: string;
}

export class EngineFactory {
  static create(name: string, options: ScenarioOptions): Engine {
    switch (name) {
      case 'socketio':
      case 'socket.io':
        return new SocketEngine(options);
      case 'http':
        return new HttpEngine(options);
      default:
        throw new Error(`Engine ${name} is not supported`);
    }
  }
}
