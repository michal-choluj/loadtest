import { EventEmitter } from 'events';
import { IMetricEngine } from '@pulseio/metric-engine';
import { IPluginEngine } from './core.plugin';
import { Context, ScenarioOptionsDto } from './index';

declare interface IEngineEvents {
  start: () => void;
  finish: () => void;
}

export interface IEngine {
  /**
   * Number of virtual users
   *
   * @type {number}
   * @memberof IEngine
   */
  get maxVirtualUsers(): number;

  /**
   * A rate limit is the number of API calls
   *
   * @type {number}
   * @memberof IEngine
   */
  get maxRateLimit(): number;

  /**
   * Execute configured engine
   *
   * @returns {Promise<void>}
   * @memberof IEngine
   */
  execute(): Promise<void>;

  /**
   * Sets the metric client for the engine
   *
   * @param {IMetricEngine} metricEngine
   * @returns {this}
   * @memberof IEngine
   */
  setMetricClient(metricEngine: IMetricEngine): this;

  /**
   * Adds the listener function
   *
   * @param {String} event
   * @param {Function} listener
   * @returns {this}
   * @memberof IEngine
   */
  on<EventKey extends keyof IEngineEvents>(
    event: EventKey,
    listener: IEngineEvents[EventKey],
  ): this;

  /**
   * Synchronously calls each of the listeners registered for the event named eventName
   *
   * @param {String} event
   * @param {Function} listener
   * @returns {this}
   * @memberof IEngine
   */
  emit<EventKey extends keyof IEngineEvents>(
    event: EventKey,
    ...args: Parameters<IEngineEvents[EventKey]>
  ): boolean;
}

/**
 * Scenario engine
 * Base-class for scenario-engine implementations.
 *
 * @export
 * @abstract
 * @class Engine
 */
export abstract class Engine extends EventEmitter implements IEngine {
  protected counter = 0;
  protected options: ScenarioOptionsDto;
  protected tasks: IPluginEngine[];
  protected metric: IMetricEngine;

  constructor(options: ScenarioOptionsDto) {
    super();
    this.options = options;
    this.tasks = this.populate();
  }

  /**
   * Number of virtual users
   *
   * @type {number}
   * @memberof Engine
   */
  public get maxRateLimit(): number {
    return this.options.maxRateLimit;
  }

  /**
   * A rate limit is the number of API calls
   *
   * @type {number}
   * @memberof Engine
   */
  public get maxVirtualUsers(): number {
    return this.options.maxVirtualUsers;
  }

  /**
   * Sets the metric client for the engine
   *
   * @param {IMetricEngine} metricEngine
   * @returns {this}
   * @memberof Engine
   */
  public setMetricClient(metricEngine: IMetricEngine): this {
    this.metric = metricEngine;
    return this;
  }

  /**
   * Run the engine to execute with the given scenario
   *
   * @returns {Promise<void>}
   * @memberof SocketEngine
   */
  public async execute(): Promise<void> {
    for (let index = 0; index < this.maxVirtualUsers; index++) {
      await this.createUser();
    }
  }

  /**
   * Create tasks based on the given scenario configuration
   *
   * @returns {IPluginEngine[]}
   * @memberof Engine
   */
  protected abstract populate(): IPluginEngine[];

  /**
   * Run the flow of the given scenario
   *
   * @param {FlowContext}: context
   * @returns {Promise<void>}
   * @memberof Engine
   */
  protected async flow(context: Context): Promise<void> {
    for (const task of this.tasks) {
      await task.execute(context);
    }
    this.detectProgress();
  }

  /**
   * Execute flow for virtual user
   *
   * @returns {Promise<void>}
   * @memberof Engine
   */
  protected async createUser(): Promise<void> {
    this.flow(new Context(this.metric)).then(() => null);
    return this.sleep();
  }

  /**
   * Wait to create a next user
   *
   * @returns {Promise<void>}
   * @memberof Engine
   */
  protected sleep(): Promise<void> {
    const delay = Math.floor(1000 / this.maxRateLimit);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Detect the flow progress and emits flow events
   *
   * @returns {void}
   * @memberof Engine
   */
  private detectProgress(): void {
    if (!this.counter) {
      this.emit('start', this.maxVirtualUsers);
    }
    this.counter++;
    if (this.counter >= this.maxVirtualUsers) {
      this.emit('finish', this.maxVirtualUsers);
    }
  }
}
