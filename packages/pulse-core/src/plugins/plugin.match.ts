import Ajv from 'ajv';

export function ValidatePlugin() {
  let cache = null;
  const ajv = new Ajv();
  const getValidator = (schema) => {
    if (!cache) {
      cache = ajv.compile(schema);
    }
    return cache;
  };
  return {
    validate(schema, data) {
      const validate = getValidator(schema);
      return validate(data) ? true : false;
    },
  };
}
