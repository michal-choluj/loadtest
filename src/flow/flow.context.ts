import * as jsonpath from 'jsonpath';
import * as _ from 'lodash';

export class FlowContext {
  private storage: Record<string, any> = {};

  set(namespace: string, value: any): void {
    _.set(this.storage, namespace, value);
  }

  get(namespace) {
    return _.get(this.storage, namespace);
  }

  jsonValue(path) {
    return jsonpath.value(this.storage, path);
  }
}
