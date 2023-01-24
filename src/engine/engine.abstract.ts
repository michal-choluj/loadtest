import { EventEmitter } from 'events';
import { FlowContext } from '../flow/flow.context';
import { IMetricEngine } from '../metric/metric.core';
import { IPluginEngine } from '../plugin/plugin.engine';
import { ScenarioOptions } from '../scenarios/scenarios.index';

declare interface EngineEvents {
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
  on<EventKey extends keyof EngineEvents>(
    event: EventKey,
    listener: EngineEvents[EventKey],
  ): this;

  /**
   * Synchronously calls each of the listeners registered for the event named eventName
   *
   * @param {String} event
   * @param {Function} listener
   * @returns {this}
   * @memberof IEngine
   */
  emit<EventKey extends keyof EngineEvents>(
    event: EventKey,
    ...args: Parameters<EngineEvents[EventKey]>
  ): boolean;
}

export abstract class Engine extends EventEmitter implements IEngine {
  protected counter = 0;
  protected options: ScenarioOptions;
  protected tasks: IPluginEngine[];
  protected metric: IMetricEngine;

  constructor(options: ScenarioOptions) {
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
    return this.options?.config?.maxRateLimit || 0;
  }

  /**
   * A rate limit is the number of API calls
   *
   * @type {number}
   * @memberof Engine
   */
  public get maxVirtualUsers(): number {
    return this.options?.config?.maxVirtualUsers || 0;
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
  protected async flow(context: FlowContext): Promise<void> {
    for (const task of this.tasks) {
      await task.execute(context);
    }
    this.detectProgress();
  }

  /**
   * Execute flow for virtual user
   *
   * @returns {Promise<void>}
   */
  protected async createUser() {
    this.flow(new FlowContext(this.metric)).then(() => null);
    return this.sleep();
  }

  /**
   * Wait to create a next user
   *
   * @returns {Promise<void>}
   * @returns Engine
   */
  protected sleep(): Promise<void> {
    const delay = Math.floor(1000 / this.maxRateLimit);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Detect the flow progress and emits flow events
   *
   * @returns {void}
   * @returns Engine
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
