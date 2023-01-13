import * as Ajv from 'ajv';

export function MatchPlugin() {
  let cache = null;
  const ajv = new Ajv();
  const getValidator = (schema) => {
    if (!cache) {
      cache = ajv.compile(schema);
    }
    return cache;
  };
  return {
    match(schema, data) {
      const validate = getValidator(schema);
      if (!validate(data)) {
        // TODO: Handle errors
        console.log(validate.errors);
      }
    },
  };
}
