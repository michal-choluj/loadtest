export interface ICounter {
  inc(): void;
  dec(): void;
}

export class Counter implements ICounter {
  constructor(private service) {}
  inc(): void {
    this.service.inc();
  }
  dec(): void {
    this.service.dec();
  }
}
