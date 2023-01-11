import { io, Socket } from 'socket.io-client';
import { FlowContext } from '../flow/flow.context';

declare interface ExtendedSocket extends Socket {
  context?: object;
}

export function SocketIOPlugin(base, options) {
  return {
    async connect(context: FlowContext) {
      const socket: ExtendedSocket = io(this.options.target, {
        path: this.options.path,
        transports: this.options.transports,
      });
      return new Promise((resolve, reject) => {
        context.set('socket', socket);
        socket.once('connect', () => resolve(socket));
        socket.once('connect_error', (err) => reject(err));
      });
    },

    async emit(context: Record<string, any>) {
      const socket = context.get('socket');
      const acknowledge = base.acknowledge(context);
      const payload = base.payload(context);
      return new Promise((resolve) => {
        socket.emit(options.channel, payload, (data) => {
          acknowledge(data);
          resolve(data);
        });
      });
    },

    execute(context) {
      switch (options.type) {
        case 'connect':
          return base.connect(context);
        case 'emit':
          return base.emit(context);
        default:
          throw new Error(`Unknown type ${options.type}`);
      }
    },

    acknowledge(context: Record<string, any>) {
      return (data) => {
        const capture = options?.acknowledge?.capture;
        if (capture) {
          const captured = base.capture(capture, data);
          context.set(`${base.name}.acknowledge`, captured);
        }
      };
    },
  };
}
