const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Convert known non-ApiError failures (Mongoose validation, duplicate
 * keys, bad ObjectIds) into structured ApiErrors so the response handler
 * below can treat everything uniformly.
 */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // Invalid ObjectId (e.g. GET /departments/not-a-real-id)
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for '${err.path}': ${err.value}`);
  }

  // Schema validation failure
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.unprocessable('Validation failed', details);
  }

  // Duplicate key (unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return ApiError.conflict(`A record with this ${field} already exists`, [
      { field, message: `'${value}' is already in use` },
    ]);
  }

  // JSON parse error from express.json()
  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Malformed JSON in request body');
  }

  // Unknown / programmer error -> generic 500, hide internals in prod.
  return new ApiError(err.statusCode || 500, err.message || 'Internal server error', {
    isOperational: false,
  });
}

// eslint-disable-next-line no-unused-vars -- Express requires the 4-arg signature
function errorHandler(err, req, res, next) {
  const error = normalizeError(err);

  // Log unexpected errors with full stack; keep operational ones terse.
  if (!error.isOperational || error.statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('💥 Unhandled error:', err);
  }

  const body = {
    success: false,
    message:
      error.statusCode >= 500 && env.isProd ? 'Internal server error' : error.message,
  };

  if (error.details) body.errors = error.details;
  if (!env.isProd && error.statusCode >= 500) body.stack = err.stack;

  res.status(error.statusCode || 500).json(body);
}

module.exports = errorHandler;
