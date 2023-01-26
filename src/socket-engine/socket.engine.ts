import { IPluginEngine, PluginEngine } from '../plugin/plugin.engine';
import { PayloadPlugin } from '../plugin/plugin.payload';
import { CapturePlugin } from '../plugin/plugin.capture';
import { ValidatePlugin } from '../plugin/plugin.match';
import { SleepPlugin } from '../plugin/plugin.sleep';
import { FakerPlugin } from '../plugin/plugin.faker';
import { SocketIOPlugin } from './socket.plugin';
import { Engine } from '../core/core.engine';

const TaskEngine = PluginEngine.register([
  SocketIOPlugin,
  PayloadPlugin,
  CapturePlugin,
  ValidatePlugin,
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
   * @memberof SocketEngine
   */
  private createTask(task: Record<string, any>): IPluginEngine {
    return new TaskEngine(task.channel || task.type, task);
  }
}
