/**
 * Consistent success-response envelope so every endpoint returns the
 * same shape. Keeps the frontend contract predictable.
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: <payload>,
 *   meta: { page, limit, total, totalPages }   // only for lists
 * }
 */
function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, meta = undefined }) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
