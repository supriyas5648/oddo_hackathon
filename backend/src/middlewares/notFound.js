const ApiError = require('../utils/ApiError');

/** Catch-all for unmatched routes -> forwards a 404 to the error handler. */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
