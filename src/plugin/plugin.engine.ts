type ApiExtension = { [key: string]: any };
export type Plugin = (instance: PluginEngine, options: any) => ApiExtension;
declare type Constructor<T> = new (...args: any[]) => T;
type ClassWithPlugins = Constructor<any> & {
  plugins: Plugin[];
};

export class PluginEngine {
  public name: string;
  public options: any;
  static plugins: Plugin[] = [];

  constructor(name: string, options: object = {}) {
    this.name = name;
    this.options = options;
    const constructor = this.constructor as typeof PluginEngine;
    constructor.plugins.forEach((plugin) => {
      Object.assign(this, plugin(this, options));
    });
  }

  static register<T extends ClassWithPlugins>(this: T, newPlugins: Plugin[]) {
    const currentPlugins = this.plugins;
    return class extends this {
      static plugins = currentPlugins.concat(
        newPlugins.filter((plugin) => !currentPlugins.includes(plugin)),
      );
    };
  }

  public sleep(): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, this.options?.delay || 0),
    );
  }

  public get type() {
    return this.options.type;
  }

  public execute(context) {
    if (!this[this.type]) {
      throw new Error(`Unknown type ${this.type}`);
    }
    console.log(`Executing ${this.type}`);
    return this[this.type](context);
  }
}
