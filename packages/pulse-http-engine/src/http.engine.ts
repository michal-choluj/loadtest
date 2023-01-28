import { Engine } from '@pulseio/core';
import { HttpPlugin } from './http.plugin';
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
  HttpPlugin,
  PayloadPlugin,
  CapturePlugin,
  ValidatePlugin,
  SleepPlugin,
  FakerPlugin,
  TemplatePlugin,
]);

export class HttpEngine extends Engine {
  /**
   * Create tasks based on the given scenario
   *
   * @returns {IPluginEngine[]}
   * @memberof HttpEngine
   */
  protected populate(): IPluginEngine[] {
    const stack: IPluginEngine[] = [];
    for (const task of this.options.flow) {
      stack.push(this.createTask(task));
    }
    return stack;
  }

  /**
   * Create tasks based on the given configuration
   *
   * @param {Record<string, any>} task
   * @returns {IPluginEngine}
   * @memberof HttpEngine
   */
  private createTask(task: Record<string, any>): IPluginEngine {
    return new TaskEngine(task.path || task.type, {
      ...this.options.engine,
      ...task,
    });
  }
}
