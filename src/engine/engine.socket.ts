import { Engine } from './engine.interface';
import { PluginEngine } from '../plugin/plugin.engine';
import { PayloadPlugin } from '../plugin/plugin.payload';
import { SocketIOPlugin } from '../plugin/plugin.socketio';
import { CapturePlugin } from '../plugin/plugin.capture';
import { MatchPlugin } from '../plugin/plugin.match';
import { Middleware } from '../flow/flow.pipeline';
export { Engine as Engine };

const TaskEngine = PluginEngine.register([
  SocketIOPlugin,
  PayloadPlugin,
  CapturePlugin,
  MatchPlugin,
]);

export class SocketEngine implements Engine {
  context: any;
  config: any;

  constructor(config) {
    this.config = config;
  }

  createFlow(flowOptions) {
    const stack = [this.connectionTask()];
    for (const task of flowOptions) {
      stack.push(this.createTask(task));
    }
    return stack;
  }

  createTask(taskOptions): Middleware {
    const task = new TaskEngine(taskOptions.channel, taskOptions);
    return async (ctx) => {
      await task.execute(ctx);
    };
  }

  connectionTask() {
    return this.createTask({
      ...this.config,
      type: 'connect',
    });
  }

  private async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
