import { io, Socket } from 'socket.io-client';
import { Context } from '../core/index';

export function SocketIOPlugin(base, options) {
  return {
    get loopSize() {
      return options?.loop || 1;
    },

    get loopDelay() {
      return options?.delay || 0;
    },

    async connect(context: Context): Promise<Socket> {
      const metrics = context.metrics;
      const socket = io(this.options.target, {
        path: this.options.path,
        transports: this.options.transports,
      });
      const timer = metrics.getTimer(base.name);
      const stopWatch = timer.start();
      await new Promise((resolve, reject) => {
        context.set('socket', socket);
        socket.once('connect', () => resolve(socket));
        socket.once('connect_error', (err) => reject(err));
      });
      stopWatch.stop();
      return socket;
    },

    async disconnect(context: Context): Promise<void> {
      const socket = context.get('socket');
      if (typeof socket?.disconnect === 'function') {
        socket.disconnect();
      }
    },

    async emit(context: Context): Promise<any> {
      const metrics = context.metrics;
      const socket = context.get('socket');
      const acknowledge = base.acknowledge(context);
      const payload = base.payload(context);
      return this.loop(
        () =>
          new Promise((resolve) => {
            const timer = metrics.getTimer(options.channel);
            const stopWatch = timer.start();
            socket.emit(options.channel, payload, (data) => {
              stopWatch.stop();
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

    acknowledge(context: Context) {
      return (data) => {
        this.captureResponse(context, data);
        this.captureError(context, data);
      };
    },

    captureError(context: Context, data: object) {
      if (options?.acknowledge?.error) {
        const error = options?.acknowledge?.error;
        const captured = base.capture(error, data);
        context.set(`${base.name}.error`, captured);
        return captured;
      }
    },

    captureResponse(context: Context, data: object) {
      if (options?.acknowledge?.capture) {
        const capture = options?.acknowledge?.capture;
        const captured = base.capture(capture, data);
        context.set(`${base.name}.acknowledge`, captured);
      }
    },
  };
}
