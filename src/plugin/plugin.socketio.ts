import { io, Socket } from 'socket.io-client';
import { FlowContext } from '../flow/flow.context';

export function SocketIOPlugin(base, options) {
  return {
    get loopSize() {
      return options?.loop || 1;
    },

    get loopDelay() {
      return options?.delay || 0;
    },

    async connect(context: FlowContext): Promise<Socket> {
      const metrics = context.metrics;
      const socket = io(this.options.target, {
        path: this.options.path,
        transports: this.options.transports,
      });
      metrics.start(options.type);
      await new Promise((resolve, reject) => {
        context.set('socket', socket);
        socket.once('connect', () => resolve(socket));
        socket.once('connect_error', (err) => reject(err));
      });
      metrics.stop(options.type);
      return socket;
    },

    async emit(context: FlowContext): Promise<any> {
      const metrics = context.metrics;
      const socket = context.get('socket');
      const acknowledge = base.acknowledge(context);
      const payload = base.payload(context);
      return this.loop(
        () =>
          new Promise((resolve) => {
            metrics.start(options.channel);
            socket.emit(options.channel, payload, (data) => {
              metrics.stop(options.channel);
              acknowledge(data);
              resolve(data);
            });
          }),
      );
    },

    async loop(event: () => Promise<any>): Promise<any> {
      const size = this.loopSize;
      const delay = this.loopDelay;
      for (let index = 0; index < size; index++) {
        await event();
        await base.sleep(delay);
      }
    },

    acknowledge(context: FlowContext) {
      return (data) => {
        this.captureResponse(context, data);
        this.captureError(context, data);
      };
    },

    captureError(context: FlowContext, data: object) {
      if (options?.acknowledge?.error) {
        const error = options?.acknowledge?.error;
        const captured = base.capture(error, data);
        context.set(`${base.name}.error`, captured);
        return captured;
      }
    },

    captureResponse(context: FlowContext, data: object) {
      if (options?.acknowledge?.capture) {
        const capture = options?.acknowledge?.capture;
        const captured = base.capture(capture, data);
        context.set(`${base.name}.acknowledge`, captured);
      }
    },
  };
}
