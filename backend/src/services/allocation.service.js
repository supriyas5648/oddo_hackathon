const Allocation = require('../models/allocation.model');
const Asset = require('../models/asset.model');
const Employee = require('../models/employee.model');
const Maintenance = require('../models/maintenance.model');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/queryFeatures');

const POPULATE = [
  { path: 'asset', select: 'name assetTag status' },
  { path: 'employee', select: 'name email designation status' },
  { path: 'allocatedBy', select: 'fullName email' },
  { path: 'returnedBy', select: 'fullName email' },
];

/** Employee must exist AND be Active to receive an allocation. */
async function resolveEmployee(employeeId) {
  const employee = await Employee.findById(employeeId).select('_id status');
  if (!employee) throw ApiError.badRequest('employee does not reference an existing employee');
  if (employee.status !== 'Active') {
    throw ApiError.conflict('Employee is not Active and cannot receive allocations');
  }
  return employee;
}

/**
 * Allocate an asset to an employee. `managerId` is the logged-in manager and
 * is stored as `allocatedBy` — the caller never chooses it.
 *
 * Concurrency-safe without transactions: we atomically "claim" the asset by
 * flipping Available -> Allocated in a single findOneAndUpdate. Only one
 * concurrent request can win that swap. If creating the allocation then fails,
 * we compensate by reverting the asset back to Available.
 */
async function create(payload, managerId) {
  const { asset: assetId, employee: employeeId } = payload;

  // 1. Validate the employee up front (cheap, clear error).
  await resolveEmployee(employeeId);

  // 2. Ensure the asset exists (distinguish "missing" from "not available").
  const assetExists = await Asset.findById(assetId).select('_id status');
  if (!assetExists) throw ApiError.notFound('Asset not found');

  // 3. Guard against an existing active allocation with a friendly message
  //    (the partial unique index is the ultimate backstop).
  const activeExists = await Allocation.exists({ asset: assetId, status: 'Active' });
  if (activeExists) {
    throw ApiError.conflict('This asset already has an active allocation');
  }

  // 4. Atomically claim the asset. Fails (null) if it isn't Available.
  const claimed = await Asset.findOneAndUpdate(
    { _id: assetId, status: 'Available' },
    { $set: { status: 'Allocated' } },
    { new: true }
  );
  if (!claimed) {
    throw ApiError.conflict(
      `Only assets with status 'Available' can be allocated (current status: '${assetExists.status}')`
    );
  }

  // 5. Create the allocation; revert the asset on any failure.
  try {
    const allocation = await Allocation.create({
      asset: assetId,
      employee: employeeId,
      allocatedBy: managerId,
      allocationDate: payload.allocationDate,
      expectedReturnDate: payload.expectedReturnDate,
      purpose: payload.purpose,
      remarks: payload.remarks,
    });
    return allocation.populate(POPULATE);
  } catch (err) {
    // Compensating action: undo the claim so the asset isn't stuck as Allocated.
    await Asset.findByIdAndUpdate(assetId, { $set: { status: 'Available' } });
    if (err.code === 11000) {
      throw ApiError.conflict('This asset already has an active allocation');
    }
    throw err;
  }
}

/**
 * Return (check in) an allocated asset.
 *
 * Concurrency-safe: we atomically flip the allocation Active -> Returned in a
 * single findOneAndUpdate, so only one concurrent return can win. Once the
 * allocation is no longer Active it leaves the partial unique index, freeing
 * the asset. We then set the asset back to Available with its reported
 * condition. The allocation row is preserved as history (never deleted).
 */
async function returnAsset(allocationId, payload, managerId) {
  const { returnCondition } = payload;
  const returnDate = payload.returnDate || new Date();

  const allocation = await Allocation.findOneAndUpdate(
    { _id: allocationId, status: 'Active' },
    {
      $set: {
        status: 'Returned',
        actualReturnDate: returnDate,
        returnCondition,
        returnRemarks: payload.returnRemarks || '',
        returnedBy: managerId, // logged-in manager, set server-side
      },
    },
    { new: true }
  );

  if (!allocation) {
    // Distinguish "no such allocation" from "already returned/cancelled".
    const exists = await Allocation.findById(allocationId).select('status');
    if (!exists) throw ApiError.notFound('Allocation not found');
    throw ApiError.conflict(`Allocation is not active (current status: '${exists.status}')`);
  }

  // Damaged assets go into maintenance instead of straight back to the pool.
  const isDamaged = returnCondition === 'Damaged';
  await Asset.findByIdAndUpdate(allocation.asset, {
    $set: {
      status: isDamaged ? 'Under Maintenance' : 'Available',
      condition: returnCondition,
    },
  });

  // Auto-open a Pending maintenance request (no technician / start date yet).
  if (isDamaged) {
    await Maintenance.create({
      asset: allocation.asset,
      issue: payload.returnRemarks || 'Reported damaged on return',
      status: 'Pending',
      createdBy: managerId,
    });
  }

  return allocation.populate(POPULATE);
}

function buildListFilter(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.asset) filter.asset = query.asset;
  if (query.employee) filter.employee = query.employee;
  return filter;
}

async function list(query) {
  return paginate(Allocation, {
    filter: buildListFilter(query),
    sort: query.sort || '-allocationDate',
    page: query.page,
    limit: query.limit,
    populate: POPULATE,
  });
}

async function getById(id) {
  const allocation = await Allocation.findById(id).populate(POPULATE);
  if (!allocation) throw ApiError.notFound('Allocation not found');
  return allocation;
}

/** Allocation history for a single asset (newest first). */
async function getByAsset(assetId, query = {}) {
  const filter = { asset: assetId };
  if (query.status) filter.status = query.status;
  return paginate(Allocation, {
    filter,
    sort: '-allocationDate',
    page: query.page,
    limit: query.limit,
    populate: POPULATE,
  });
}

/** Allocation history for a single employee (newest first). */
async function getByEmployee(employeeId, query = {}) {
  const filter = { employee: employeeId };
  if (query.status) filter.status = query.status;
  return paginate(Allocation, {
    filter,
    sort: '-allocationDate',
    page: query.page,
    limit: query.limit,
    populate: POPULATE,
  });
}

module.exports = { create, returnAsset, list, getById, getByAsset, getByEmployee };
