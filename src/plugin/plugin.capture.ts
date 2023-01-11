import * as jsonpath from 'jsonpath';

export function CapturePlugin() {
  return {
    capture(params, data) {
      const captures = {};
      for (const param of params) {
        captures[param.as] = jsonpath.value(data, param.json);
      }
      return captures;
    },
  };
}
