import axios, { AxiosResponse } from 'axios';
import { Context, PluginEngine } from '@pulseio/core';

class Plugin {
  constructor(private plugin, private options) {}

  get method() {
    return this.options?.type;
  }

  get target() {
    return this.options?.target;
  }

  get capture() {
    return this.options?.capture;
  }

  get validate() {
    return this.options?.validate;
  }

  get payload() {
    return this.options?.payload;
  }

  get url() {
    return `${this.target}${this.options.path}`;
  }

  public captureResponse(context: Context, data: object) {
    if (this.capture) {
      for (const param of this.capture) {
        const value = this.plugin.capture(data, param.json);
        context.set(param.as, value);
      }
    }
  }

  public validateResponse(context: Context, data: object) {
    const metrics = context.metrics;
    if (this.validate) {
      const validMeter = metrics.getCounter(`invalid:${this.options.path}`);
      const isValid = this.plugin.validate(this.validate, data);
      if (!isValid) {
        validMeter.inc();
      }
    }
  }

  public async makeRequest(context: Context): Promise<AxiosResponse> {
    const metrics = context.metrics;
    const payload = this.plugin.payload(context);
    const timer = metrics.getTimer(`${this.method}:${this.options.path}`);
    const stopWatch = timer.start();
    const data = await axios({
      method: this.method,
      url: context.template(this.url),
      data: payload,
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
export function HttpPlugin(base: PluginEngine, options: Context) {
  const plugin = new Plugin(base, options);
  return {
    async get(context: Context): Promise<void> {
      const response = await plugin.makeRequest(context);
      plugin.captureResponse(context, response.data);
      plugin.validateResponse(context, response.data);
    },
    async post(context: Context): Promise<void> {
      const response = await plugin.makeRequest(context);
      plugin.captureResponse(context, response.data);
      plugin.validateResponse(context, response.data);
    },
    async path(context: Context): Promise<void> {
      const response = await plugin.makeRequest(context);
      plugin.captureResponse(context, response.data);
      plugin.validateResponse(context, response.data);
    },
    async put(context: Context): Promise<void> {
      const response = await plugin.makeRequest(context);
      plugin.captureResponse(context, response.data);
      plugin.validateResponse(context, response.data);
    },
    async delete(context: Context): Promise<void> {
      const response = await plugin.makeRequest(context);
      plugin.captureResponse(context, response.data);
      plugin.validateResponse(context, response.data);
    },
  };
}
