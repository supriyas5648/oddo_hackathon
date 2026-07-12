const Maintenance = require('../models/maintenance.model');
const Asset = require('../models/asset.model');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/queryFeatures');

const POPULATE = [
  { path: 'asset', select: 'name assetTag status condition' },
  { path: 'createdBy', select: 'fullName email' },
  { path: 'completedBy', select: 'fullName email' },
];

async function list(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.technician) filter.technicianName = query.technician;

  return paginate(Maintenance, {
    filter,
    search: query.search,
    searchFields: ['issue', 'technicianName', 'resolution'],
    sort: query.sort || '-createdAt',
    page: query.page,
    limit: query.limit,
    populate: POPULATE,
  });
}

async function getById(id) {
  const record = await Maintenance.findById(id).populate(POPULATE);
  if (!record) throw ApiError.notFound('Maintenance request not found');
  return record;
}

/** Distinct technician names (for the "Filter by Technician" dropdown). */
async function technicians() {
  const names = await Maintenance.distinct('technicianName', {
    technicianName: { $nin: [null, ''] },
  });
  return names.sort((a, b) => a.localeCompare(b));
}

/**
 * Start Repair: Pending -> In Progress. Records technician, estimate and
 * notes and stamps the start date. The asset stays "Under Maintenance".
 * Atomic status transition so two managers can't both start the same job.
 */
async function startRepair(id, payload) {
  const record = await Maintenance.findOneAndUpdate(
    { _id: id, status: 'Pending' },
    {
      $set: {
        status: 'In Progress',
        technicianName: payload.technicianName,
        estimatedRepairCost: payload.estimatedRepairCost ?? 0,
        repairNotes: payload.repairNotes || '',
        maintenanceStartDate: new Date(),
      },
    },
    { new: true }
  );

  if (!record) {
    const exists = await Maintenance.findById(id).select('status');
    if (!exists) throw ApiError.notFound('Maintenance request not found');
    throw ApiError.conflict(`Repair can only be started on a Pending request (current: '${exists.status}')`);
  }
  return record.populate(POPULATE);
}

/**
 * Complete Repair: In Progress -> Completed. Stamps completion, records the
 * final cost/resolution and returns the asset to service (Available) with the
 * selected condition. `managerId` is stored as completedBy.
 */
async function completeRepair(id, payload, managerId) {
  const record = await Maintenance.findOneAndUpdate(
    { _id: id, status: 'In Progress' },
    {
      $set: {
        status: 'Completed',
        maintenanceCompletedDate: new Date(),
        completedBy: managerId,
        resolution: payload.resolution || '',
        remarks: payload.remarks || '',
        completedCondition: payload.assetCondition,
        repairCost: payload.repairCost ?? 0,
      },
    },
    { new: true }
  );

  if (!record) {
    const exists = await Maintenance.findById(id).select('status');
    if (!exists) throw ApiError.notFound('Maintenance request not found');
    throw ApiError.conflict(
      `Repair can only be completed on an In Progress request (current: '${exists.status}')`
    );
  }

  // Return the asset to service with its repaired condition.
  await Asset.findByIdAndUpdate(record.asset, {
    $set: { status: 'Available', condition: payload.assetCondition },
  });

  return record.populate(POPULATE);
}

module.exports = { list, getById, technicians, startRepair, completeRepair };
