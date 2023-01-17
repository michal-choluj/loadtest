import { Engine } from './engine.interface';
import { IPluginEngine, PluginEngine } from '../plugin/plugin.engine';
import { PayloadPlugin } from '../plugin/plugin.payload';
import { SocketIOPlugin } from '../plugin/plugin.socketio';
import { CapturePlugin } from '../plugin/plugin.capture';
import { MatchPlugin } from '../plugin/plugin.match';
import { SleepPlugin } from '../plugin/plugin.sleep';
import { FlowContext } from '../flow/flow.context';
import { FakerPlugin } from '../plugin/plugin.faker';
import { ScenarioOptions } from '../scenarios/scenarios.index';
import { EventEmitter } from 'stream';
export { Engine as Engine };

const TaskEngine = PluginEngine.register([
  SocketIOPlugin,
  PayloadPlugin,
  CapturePlugin,
  MatchPlugin,
  SleepPlugin,
  FakerPlugin,
]);

export class SocketEngine extends EventEmitter implements Engine {
  private options: any;
  private tasks: IPluginEngine[];
  private counter = 0;

  constructor(options: ScenarioOptions) {
    super();
    this.options = options;
    this.tasks = this.create();
  }

  get maxVirtualUsers(): number {
    return this.options?.config?.maxVirtualUsers || 0;
  }

  get connectionsPerSecond(): number {
    return this.options?.config?.connectionsPerSecond || 0;
  }

  public async execute(context: FlowContext): Promise<void> {
    for (const task of this.tasks) {
      await task.execute(context);
    }
    this.registerProgress();
  }

  private registerProgress() {
    if (!this.counter) {
      this.emit('started', this.maxVirtualUsers);
    }
    this.counter++;
    if (this.counter >= this.maxVirtualUsers) {
      this.emit('finished', this.maxVirtualUsers);
    }
  }

  private create(): IPluginEngine[] {
    const stack = [
      this.createTask({
        ...this.options.config,
        type: 'connect',
      }),
    ];
    for (const task of this.options?.flow) {
      stack.push(this.createTask(task));
    }
    // stack.push(
    //   this.createTask({
    //     type: 'disconnect',
    //   }),
    // );
    return stack;
  }

  private createTask(task) {
    return new TaskEngine(task.channel || task.type, task);
  }
}
