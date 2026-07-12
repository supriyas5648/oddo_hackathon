const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** Extract a bearer token from the Authorization header. */
function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/**
 * Route guard: requires a valid Manager session. Attaches `req.manager`.
 * Every business route (assets, allocations, employees, ...) sits behind this.
 */
const protect = catchAsync(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, 'Authentication required. Please log in.');
  req.manager = await authService.verifySession(token);
  next();
});

module.exports = { protect };
