import * as jsonpath from 'jsonpath';

export function CapturePlugin() {
  return {
    capture(data, jsonPath) {
      return jsonpath.value(data, jsonPath);
    },
  };
}
