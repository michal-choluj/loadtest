import { faker } from '@faker-js/faker';
import { get } from 'lodash';

export function FakerPlugin() {
  return {
    faker(path, params): Promise<void> {
      return get(faker, path, () => path)(params);
    },
  };
}
