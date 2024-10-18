import { ValueTransformer } from 'typeorm';

export class TimestampColumnType implements ValueTransformer {
  to(value: Date): string {
    return value.toISOString();
  }

  from(value: string): Date {
    return new Date(value);
  }
}