import { FlowContext } from '../flow/flow.context';

declare interface EngineEvents {
  started: () => void;
  finished: () => void;
}

export declare interface Engine {
  get maxVirtualUsers(): number;
  get connectionsPerSecond(): number;
  execute(context: FlowContext): Promise<void>;
  on<EventKey extends keyof EngineEvents>(
    event: EventKey,
    listener: EngineEvents[EventKey],
  ): this;
  emit<EventKey extends keyof EngineEvents>(
    event: EventKey,
    ...args: Parameters<EngineEvents[EventKey]>
  ): boolean;
}
