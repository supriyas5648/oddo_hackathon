const ApiError = require('../utils/ApiError');

/**
 * Generic request-validation middleware driven by a Joi schema map.
 * Validates `body`, `query`, and `params` independently, strips unknown
 * keys, coerces types, and writes the sanitized values back onto `req`.
 *
 *   router.post('/', validate(createDepartmentSchema), controller.create);
 *
 * where schema = { body?, query?, params? } of Joi schemas.
 */
const validate = (schema) => (req, res, next) => {
  const parts = ['params', 'query', 'body'];
  const details = [];

  for (const part of parts) {
    if (!schema[part]) continue;

    const { value, error } = schema[part].validate(req[part], {
      abortEarly: false, // collect all errors, not just the first
      stripUnknown: true, // drop keys not declared in the schema
      convert: true, // coerce "10" -> 10, "true" -> true, etc.
    });

    if (error) {
      error.details.forEach((d) => {
        details.push({ field: d.path.join('.'), message: d.message.replace(/"/g, "'") });
      });
    } else {
      // Note: req.query getter is read-only in Express 5; assign per-key for safety.
      if (part === 'query') {
        Object.keys(value).forEach((k) => { req.query[k] = value[k]; });
      } else {
        req[part] = value;
      }
    }
  }

  if (details.length > 0) {
    return next(ApiError.unprocessable('Validation failed', details));
  }
  return next();
};

module.exports = validate;
