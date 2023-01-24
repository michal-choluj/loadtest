import { IPluginEngine, PluginEngine } from '../plugin/plugin.engine';
import { PayloadPlugin } from '../plugin/plugin.payload';
import { CapturePlugin } from '../plugin/plugin.capture';
import { MatchPlugin } from '../plugin/plugin.match';
import { SleepPlugin } from '../plugin/plugin.sleep';
import { FakerPlugin } from '../plugin/plugin.faker';
import { Engine } from '../engine/engine.abstract';
import { HttpPlugin } from './http.plugin';

const TaskEngine = PluginEngine.register([
  HttpPlugin,
  PayloadPlugin,
  CapturePlugin,
  MatchPlugin,
  SleepPlugin,
  FakerPlugin,
]);

export class HttpEngine extends Engine {
  /**
   * Create tasks based on the given scenario
   *
   * @returns {IPluginEngine[]}
   * @memberof SocketEngine
   */
  protected populate(): IPluginEngine[] {
    const stack = [];
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
    return new TaskEngine(task.path || task.type, {
      ...this.options.config,
      ...task,
    });
  }
}
