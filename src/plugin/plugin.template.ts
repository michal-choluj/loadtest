import { Context } from '../core';

export function TemplatePlugin(base) {
  return {
    template(context: Context, item: any): string {
      if (item.function) {
        return base.faker(item.function, item?.params);
      } else if (/\${/.test(item)) {
        return context.template(item);
      } else if (/^\$./.test(item)) {
        return context.jsonValue(item);
      } else {
        return item;
      }
    },
  };
}
