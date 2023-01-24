import { FlowContext } from '../flow/flow.context';
import axios, { AxiosResponse } from 'axios';
import { PluginEngine } from '../plugin/plugin.index';
import { FlowOptions } from '../flow/flow.index';

class Plugin {
  constructor(private plugin, private options) {}

  get method() {
    return this.options?.type;
  }

  get target() {
    return this.options?.target;
  }

  get capture() {
    return this.options?.response?.capture;
  }

  get url() {
    return `${this.target}${this.options.path}`;
  }

  get payload() {
    return this.options?.payload;
  }

  public captureResponse(context: FlowContext, data: object) {
    if (this.capture) {
      const capture = this.options?.acknowledge?.capture;
      const captured = this.plugin.capture(capture, data);
      context.set(`${this.plugin.name}.response`, captured);
    }
  }

  public async makeRequest(context: FlowContext): Promise<AxiosResponse> {
    const metrics = context.metrics;
    const timer = metrics.getTimer(this.plugin.name);
    const stopWatch = timer.start();
    const data = await axios({
      method: this.method,
      url: this.url,
      data: this.payload,
    });
    stopWatch.stop();
    return data;
  }
}

/**
 *
 * @param {PluginEngine} base
 * @param {FlowOptions} options
 * @returns {Object}
 */
export function HttpPlugin(base: PluginEngine, options: FlowOptions) {
  const plugin = new Plugin(base, options);
  return {
    async get(context: FlowContext): Promise<void> {
      const data = await plugin.makeRequest(context);
      plugin.captureResponse(context, data);
    },
    async post(context: FlowContext): Promise<void> {
      await plugin.makeRequest(context);
    },
    async path(context: FlowContext): Promise<void> {
      await plugin.makeRequest(context);
    },
    async put(context: FlowContext): Promise<void> {
      await plugin.makeRequest(context);
    },
    async delete(context: FlowContext): Promise<void> {
      await plugin.makeRequest(context);
    },
  };
}
