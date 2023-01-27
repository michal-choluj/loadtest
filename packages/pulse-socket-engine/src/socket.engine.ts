import { Engine } from '@pulseio/core';
import { SocketIOPlugin } from './socket.plugin';
import {
  TemplatePlugin,
  FakerPlugin,
  SleepPlugin,
  ValidatePlugin,
  CapturePlugin,
  PayloadPlugin,
  IPluginEngine,
  PluginEngine,
} from '@pulseio/core';

const TaskEngine = PluginEngine.register([
  SocketIOPlugin,
  TemplatePlugin,
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
