import { IPluginEngine, PluginEngine } from '../plugin/plugin.engine';
import { PayloadPlugin } from '../plugin/plugin.payload';
import { CapturePlugin } from '../plugin/plugin.capture';
import { MatchPlugin } from '../plugin/plugin.match';
import { SleepPlugin } from '../plugin/plugin.sleep';
import { FakerPlugin } from '../plugin/plugin.faker';
import { Engine } from '../engine/engine.abstract';
import { SocketIOPlugin } from './plugin.socketio';

const TaskEngine = PluginEngine.register([
  SocketIOPlugin,
  PayloadPlugin,
  CapturePlugin,
  MatchPlugin,
  SleepPlugin,
  FakerPlugin,
]);

export class SocketEngine extends Engine {
  /**
   * Create tasks based on the given scenario
   *
   * @returns {IPluginEngine[]}
   * @memberof SocketEngine
   */
  protected populate(): IPluginEngine[] {
    const stack = [
      this.createTask({
        ...this.options.config,
        type: 'connect',
      }),
    ];
    for (const task of this.options?.flow) {
      stack.push(this.createTask(task));
    }
    return stack;
  }

  /**
   * Create tasks based on the given configuration
   *
   * @param {FlowOptions} task
   * @returns {IPluginEngine}
   */
  private createTask(task: Record<string, any>): IPluginEngine {
    return new TaskEngine(task.channel || task.type, task);
  }
}
