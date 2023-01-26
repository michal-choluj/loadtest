import { Context } from '../core.context';

export function PayloadPlugin(base, options) {
  return {
    payload(context: Context) {
      const output = {};
      for (const key in options.payload) {
        output[key] = base.template(context, options.payload[key]);
      }
      context.set(`payload`, output);
      return output;
    },
  };
}
