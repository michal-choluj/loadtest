export interface ICounterAdapter {
  inc(): void;
  dec(): void;
}

export class CounterAdapter implements ICounterAdapter {
  constructor(private service) {}
  inc(): void {
    this.service.inc();
  }
  dec(): void {
    this.service.dec();
  }
}
