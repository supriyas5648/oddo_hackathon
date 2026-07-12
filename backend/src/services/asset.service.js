const Asset = require('../models/asset.model');
const Counter = require('../models/counter.model');
const Category = require('../models/category.model');
const Department = require('../models/department.model');
const Manager = require('../models/manager.model');
const Allocation = require('../models/allocation.model');
const Maintenance = require('../models/maintenance.model');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/queryFeatures');

const POPULATE = [
  { path: 'category', select: 'name icon' },
  { path: 'department', select: 'name code' },
  { path: 'createdBy', select: 'fullName email' },
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

/** Validate that referenced category/department/manager actually exist. */
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
      Manager.exists({ _id: createdBy }).then((ok) => {
        if (!ok) throw ApiError.badRequest('createdBy does not reference an existing manager');
      })
    );
  }
  await Promise.all(checks);
}

/** `managerId` (the logged-in manager) is recorded as the asset's creator. */
async function create(payload, managerId) {
  await assertReferencesExist({ ...payload, createdBy: managerId });

  // Guard duplicate serials with a friendly error before hitting the index.
  const existing = await Asset.exists({ serialNumber: payload.serialNumber });
  if (existing) {
    throw ApiError.conflict('An asset with this serial number already exists', [
      { field: 'serialNumber', message: `'${payload.serialNumber}' is already in use` },
    ]);
  }

  const assetTag = await generateAssetTag();
  const asset = await Asset.create({ ...payload, assetTag, createdBy: managerId || null });
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
  const asset = await Asset.findById(id).select('serialNumber');
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

  // findByIdAndUpdate validates ONLY the fields being changed (unlike .save(),
  // which validates the whole document). This keeps legacy assets that pre-date
  // the required department/category editable, while still rejecting an attempt
  // to set either of those to an invalid value.
  const updated = await Asset.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate(POPULATE);
  return updated;
}

/**
 * Soft delete: never remove the document. Mark it Disposed so history,
 * audit trails, and references remain intact.
 */
async function remove(id) {
  const asset = await Asset.findById(id).select('status');
  if (!asset) throw ApiError.notFound('Asset not found');

  if (asset.status === 'Disposed') {
    throw ApiError.conflict('Asset is already disposed');
  }

  // Atomic status flip (not .save()) so disposing never trips validation on
  // legacy assets that lack the now-required department/category.
  const disposed = await Asset.findByIdAndUpdate(
    id,
    { $set: { status: 'Disposed' } },
    { new: true }
  ).populate(POPULATE);
  return disposed;
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

// Logical workflow order — used ONLY to break ties when two events share the
// exact same timestamp, so the later workflow step still sorts on top.
const LIFECYCLE_RANK = {
  created: 0,
  allocated: 1,
  transferred: 2, // future-ready
  returned: 3,
  maintenance_started: 4,
  maintenance_completed: 5,
};

/** Parse a value to a millisecond timestamp, or null if missing/invalid. */
function toTimestamp(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Build the asset lifecycle timeline from existing data — no separate history
 * collection. Events are derived from the asset's creation plus every
 * allocation/return/maintenance, then sorted strictly by their real business
 * event date (newest first), NOT by document insertion order.
 */
async function lifecycle(id) {
  const asset = await Asset.findById(id).select('name assetTag createdAt');
  if (!asset) throw ApiError.notFound('Asset not found');

  const [allocations, maintenances] = await Promise.all([
    Allocation.find({ asset: id })
      .populate({ path: 'employee', select: 'name' })
      .select('employee allocationDate actualReturnDate status returnCondition')
      .lean(),
    Maintenance.find({ asset: id })
      .select('technicianName maintenanceStartDate maintenanceCompletedDate completedCondition status')
      .lean(),
  ]);

  const events = [];

  // Asset Created — always present. Fall back to the ObjectId's embedded
  // timestamp if createdAt is somehow missing (e.g. a hand-inserted doc), so
  // this event never carries an invalid date.
  events.push({
    type: 'created',
    title: 'Asset Created',
    date: asset.createdAt || asset._id.getTimestamp(),
  });

  allocations.forEach((a) => {
    const employeeName = a.employee?.name || 'Unknown';
    const employee = a.employee ? { _id: a.employee._id, name: a.employee.name } : null;

    events.push({
      type: 'allocated',
      title: `Allocated to ${employeeName}`,
      date: a.allocationDate || a._id.getTimestamp(),
      employee,
      allocationId: a._id,
    });

    // Returned — only once actualReturnDate exists (req 4: ignore null dates).
    if (a.status === 'Returned' && a.actualReturnDate) {
      events.push({
        type: 'returned',
        title: `Returned by ${employeeName}`,
        date: a.actualReturnDate,
        employee,
        condition: a.returnCondition || null,
        allocationId: a._id,
      });
    }
  });

  maintenances.forEach((m) => {
    // Maintenance Started — only once a technician begins the repair.
    if (m.maintenanceStartDate) {
      events.push({
        type: 'maintenance_started',
        title: 'Maintenance Started',
        date: m.maintenanceStartDate,
        technician: m.technicianName || null,
        maintenanceId: m._id,
      });
    }
    // Maintenance Completed — only once it's actually completed.
    if (m.status === 'Completed' && m.maintenanceCompletedDate) {
      events.push({
        type: 'maintenance_completed',
        title: 'Maintenance Completed',
        date: m.maintenanceCompletedDate,
        condition: m.completedCondition || null,
        maintenanceId: m._id,
      });
    }
  });

  // Transfers (future-ready): once a Transfer model exists, push events here
  // with type 'transferred' and date = transfer.transferDate. They will sort
  // in automatically via the timestamp + LIFECYCLE_RANK logic below.

  // Sort strictly by real event date (descending / newest first). Drop any
  // event whose date is null/invalid so a bad date can never scramble the
  // order (an invalid date in a subtraction comparator yields NaN, which makes
  // Array.sort produce arbitrary results). On an exact timestamp tie, fall back
  // to the logical workflow order so the later step stays on top.
  const sorted = events
    .map((e) => ({ event: e, ts: toTimestamp(e.date) }))
    .filter((e) => e.ts !== null)
    .sort((a, b) => {
      if (b.ts !== a.ts) return b.ts - a.ts;
      return (LIFECYCLE_RANK[b.event.type] ?? 0) - (LIFECYCLE_RANK[a.event.type] ?? 0);
    })
    .map((e) => e.event);

  return { asset: { _id: asset._id, name: asset.name, assetTag: asset.assetTag }, events: sorted };
}

module.exports = { create, list, getById, update, remove, stats, lifecycle, generateAssetTag };
