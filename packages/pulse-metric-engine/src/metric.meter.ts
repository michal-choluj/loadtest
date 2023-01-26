export interface IMeterAdapter {
  mark(): void;
}

export class MeterAdapter implements IMeterAdapter {
  constructor(private service) {}
  mark(): void {
    this.service.mark();
  }
}
