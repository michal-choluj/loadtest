export type Middleware = (
  context: object,
  next: (error?: Error) => Promise<any>,
  error?: Error,
) => Promise<any>;

export class FlowPipeline {
  private stack: Middleware[] = [];

  public use(middlewares: Middleware | Middleware[]): void {
    middlewares = middlewares instanceof Array ? middlewares : [middlewares];
    this.stack.push(...middlewares);
  }

  public async execute(context: object): Promise<void> {
    loop: for (const middleware of this.stack) {
      try {
        await middleware(context, async (err) => {
          return err;
        });
      } catch (error) {
        // Add error handler
        console.error(error);
        break loop;
      }
    }
  }
}
