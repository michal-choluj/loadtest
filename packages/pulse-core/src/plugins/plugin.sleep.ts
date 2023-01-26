export function SleepPlugin() {
  return {
    sleep(): Promise<void> {
      return new Promise((resolve) =>
        setTimeout(resolve, this.options?.delay || 0),
      );
    },
  };
}
