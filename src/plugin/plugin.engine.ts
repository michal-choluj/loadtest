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

  public execute(context: any) {
    console.log('Not implemented');
  }

  // public get(path) {
  //   return String(path)
  //     .split('.')
  //     .reduce((acc, v) => {
  //       try {
  //         acc = acc[v];
  //       } catch (e) {
  //         return undefined;
  //       }
  //       return acc;
  //     }, this.options);
  // }

  public get type() {
    return this.options.type;
  }
}
