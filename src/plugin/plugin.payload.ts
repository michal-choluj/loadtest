import { template } from 'lodash';
import { FlowContext } from '../flow/flow.context';

export function PayloadPlugin(base, options) {
  const getVariable = (context: FlowContext, item: any): any => {
    if (item.function) {
      return base.faker(item.function, item.params);
    } else if (/\${/.test(item)) {
      return template(item)(context);
    } else if (/^\$./.test(item)) {
      return context.jsonValue(item);
    } else {
      return item;
    }
  };

  return {
    payload(context: FlowContext) {
      const output = {};
      for (const key in options.payload) {
        output[key] = getVariable(context, options.payload[key]);
      }
      context.set(`${base.name}.payload`, output);
      return output;
    },
  };
}
