const Asset = require('../models/asset.model');
const Counter = require('../models/counter.model');
const Category = require('../models/category.model');
const Department = require('../models/department.model');
const User = require('../models/user.model');
const Allocation = require('../models/allocation.model');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/queryFeatures');

const POPULATE = [
  { path: 'category', select: 'name icon' },
  { path: 'department', select: 'name code' },
  { path: 'createdBy', select: 'name email' },
];

const TAG_PREFIX = 'AF';

/**
 * Generate the next asset tag (AF-0001, AF-0002, ...) using an atomic
 * counter so concurrent inserts never collide. Pads to at least 4 digits
 * and grows naturally beyond 9999.
 */
async function generateAssetTag() {
  const seq = await Counter.next('assetTag');
  return `${TAG_PREFIX}-${String(seq).padStart(4, '0')}`;
}

/** Validate that referenced category/department/user actually exist. */
async function assertReferencesExist({ category, department, createdBy }) {
  const checks = [];
  if (category) {
    checks.push(
      Category.exists({ _id: category }).then((ok) => {
        if (!ok) throw ApiError.badRequest('category does not reference an existing category');
      })
    );
  }
  if (department) {
    checks.push(
      Department.exists({ _id: department }).then((ok) => {
        if (!ok) throw ApiError.badRequest('department does not reference an existing department');
      })
    );
  }
  if (createdBy) {
    checks.push(
      User.exists({ _id: createdBy }).then((ok) => {
        if (!ok) throw ApiError.badRequest('createdBy does not reference an existing user');
      })
    );
  }
  await Promise.all(checks);
}

async function create(payload) {
  await assertReferencesExist(payload);

  // Guard duplicate serials with a friendly error before hitting the index.
  const existing = await Asset.exists({ serialNumber: payload.serialNumber });
  if (existing) {
    throw ApiError.conflict('An asset with this serial number already exists', [
      { field: 'serialNumber', message: `'${payload.serialNumber}' is already in use` },
    ]);
  }

  const assetTag = await generateAssetTag();
  const asset = await Asset.create({ ...payload, assetTag });
  return asset.populate(POPULATE);
}

async function list(query) {
  const filter = {};

  // Combine any provided filters (all optional, ANDed together).
  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;
  if (query.category) filter.category = query.category;
  if (query.condition) filter.condition = query.condition;
  if (query.isBookable !== undefined) filter.isBookable = query.isBookable;

  // By default, hide soft-deleted (Disposed) assets unless explicitly asked.
  if (!query.status && !query.includeDisposed) {
    filter.status = { $ne: 'Disposed' };
  }

  return paginate(Asset, {
    filter,
    search: query.search,
    searchFields: ['name', 'assetTag', 'serialNumber', 'location'],
    sort: query.sort,
    page: query.page,
    limit: query.limit,
    populate: POPULATE,
  });
}

async function getById(id) {
  const asset = await Asset.findById(id).populate(POPULATE);
  if (!asset) throw ApiError.notFound('Asset not found');
  return asset;
}

async function update(id, payload) {
  const asset = await Asset.findById(id);
  if (!asset) throw ApiError.notFound('Asset not found');

  await assertReferencesExist(payload);

  // Prevent duplicate serials if the serial number is being changed.
  if (payload.serialNumber && payload.serialNumber !== asset.serialNumber) {
    const clash = await Asset.exists({
      serialNumber: payload.serialNumber,
      _id: { $ne: id },
    });
    if (clash) {
      throw ApiError.conflict('An asset with this serial number already exists', [
        { field: 'serialNumber', message: `'${payload.serialNumber}' is already in use` },
      ]);
    }
  }

  // assetTag is immutable once issued.
  delete payload.assetTag;

  Object.assign(asset, payload);
  await asset.save();
  return asset.populate(POPULATE);
}

/**
 * Soft delete: never remove the document. Mark it Disposed so history,
 * audit trails, and references remain intact.
 */
async function remove(id) {
  const asset = await Asset.findById(id);
  if (!asset) throw ApiError.notFound('Asset not found');

  if (asset.status === 'Disposed') {
    throw ApiError.conflict('Asset is already disposed');
  }

  asset.status = 'Disposed';
  await asset.save();
  return asset.populate(POPULATE);
}

/**
 * Aggregate live counts per status in a single DB round-trip.
 * Returns every status (defaulting to 0 so the UI never has to guess) plus a
 * `total` of active inventory (everything except soft-deleted / Disposed).
 */
async function stats() {
  const rows = await Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  // Seed all known statuses at 0, then overlay the aggregation results.
  const byStatus = Asset.STATUS.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  rows.forEach(({ _id, count }) => {
    if (_id in byStatus) byStatus[_id] = count;
  });

  const total = Asset.STATUS.filter((s) => s !== 'Disposed').reduce(
    (sum, s) => sum + byStatus[s],
    0
  );

  return { total, byStatus };
}

/**
 * Build the asset lifecycle timeline from existing data — no separate history
 * collection. Events are derived from the asset's creation plus every
 * allocation/return, then sorted newest-first.
 */
async function lifecycle(id) {
  const asset = await Asset.findById(id).select('name assetTag createdAt');
  if (!asset) throw ApiError.notFound('Asset not found');

  const allocations = await Allocation.find({ asset: id })
    .populate({ path: 'employee', select: 'name' })
    .select('employee allocationDate actualReturnDate status returnCondition')
    .lean();

  const events = [
    { type: 'created', title: 'Asset Created', date: asset.createdAt },
  ];

  allocations.forEach((a) => {
    const employeeName = a.employee?.name || 'Unknown';
    events.push({
      type: 'allocated',
      title: `Allocated to ${employeeName}`,
      date: a.allocationDate,
      employee: a.employee ? { _id: a.employee._id, name: a.employee.name } : null,
      allocationId: a._id,
    });

    // A return event only exists once the allocation has actually been returned.
    if (a.status === 'Returned' && a.actualReturnDate) {
      events.push({
        type: 'returned',
        title: `Returned by ${employeeName}`,
        date: a.actualReturnDate,
        employee: a.employee ? { _id: a.employee._id, name: a.employee.name } : null,
        condition: a.returnCondition || null,
        allocationId: a._id,
      });
    }
  });

  // Newest first. Ties (same timestamp) keep insertion order deterministically.
  events.sort((x, y) => new Date(y.date) - new Date(x.date));

  return { asset: { _id: asset._id, name: asset.name, assetTag: asset.assetTag }, events };
}

module.exports = { create, list, getById, update, remove, stats, lifecycle, generateAssetTag };
