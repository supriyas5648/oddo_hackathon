/**
 * Reusable helper that turns a validated query object into a paginated,
 * filtered, sorted Mongoose query. Keeps list controllers thin and
 * consistent across every collection.
 *
 * Usage:
 *   const { results, meta } = await paginate(Department, {
 *     filter: { status: 'Active' },
 *     search: req.query.search,
 *     searchFields: ['name', 'code'],
 *     sort: req.query.sort,
 *     page: req.query.page,
 *     limit: req.query.limit,
 *     populate: [{ path: 'departmentHead', select: 'name email' }],
 *   });
 */
async function paginate(Model, options = {}) {
  const {
    filter = {},
    search,
    searchFields = [],
    sort = '-createdAt',
    page = 1,
    limit = 10,
    populate = [],
    lean = true,
  } = options;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const query = { ...filter };

  // Case-insensitive OR search across the given fields.
  if (search && searchFields.length > 0) {
    const regex = new RegExp(escapeRegex(search), 'i');
    query.$or = searchFields.map((field) => ({ [field]: regex }));
  }

  let dbQuery = Model.find(query).sort(sort).skip(skip).limit(limitNum);
  populate.forEach((p) => {
    dbQuery = dbQuery.populate(p);
  });
  if (lean) dbQuery = dbQuery.lean();

  const [results, total] = await Promise.all([
    dbQuery.exec(),
    Model.countDocuments(query),
  ]);

  return {
    results,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/** Escape user input before building a RegExp to avoid ReDoS / syntax errors. */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { paginate, escapeRegex };
