import 'reflect-metadata';
import { instanceToInstance } from 'class-transformer';
import { validateSync, ValidationOptions } from 'class-validator';

/**
 * Creates a new data transfer object which will validate and reshape its input
 * data based on the validators of its own properties.
 */
export abstract class DataTransferObject {
  /**
   * Constructs a new instance of a data transfer object with the given input.
   * @param data The input data to assign to this data transfer object.
   */
  constructor(data: unknown) {
    Object.assign(this, data);
  }

  /**
   * Validates this object (sync validators only), and returns transformed instance if validations pass.
   * Otherwise, throws an error
   *
   * @param opts Options to pass to the validator system.
   */
  public validate(opts?: ValidationOptions) {
    const test = instanceToInstance(this);
    const errors = validateSync(test, {
      stopAtFirstError: true,
      forbidUnknownValues: false,
      ...opts,
    });
    if (errors.length > 0) {
      const message = errors.map((err) => err.toString());
      throw new Error(message.join('\n'));
    }
    return this;
  }
}
