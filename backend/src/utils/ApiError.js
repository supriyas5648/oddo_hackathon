/**
 * Operational error carrying an HTTP status code.
 * Anything thrown as an ApiError is a *known*, expected failure
 * (bad input, not found, conflict). Everything else is treated as
 * an unexpected programmer error by the global error handler.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message    Human-readable message
   * @param {object} [options]
   * @param {Array}  [options.details] Field-level error details
   * @param {boolean}[options.isOperational=true]
   */
  constructor(statusCode, message, { details = undefined, isOperational = true } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad request', details) {
    return new ApiError(400, msg, { details });
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Resource already exists', details) {
    return new ApiError(409, msg, { details });
  }

  static unprocessable(msg = 'Unprocessable entity', details) {
    return new ApiError(422, msg, { details });
  }
}

module.exports = ApiError;
