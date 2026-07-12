const maintenanceService = require('../services/maintenance.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const list = catchAsync(async (req, res) => {
  const { results, meta } = await maintenanceService.list(req.query);
  sendSuccess(res, { message: 'Maintenance requests fetched', data: results, meta });
});

const technicians = catchAsync(async (req, res) => {
  const data = await maintenanceService.technicians();
  sendSuccess(res, { message: 'Technicians fetched', data });
});

const getById = catchAsync(async (req, res) => {
  const data = await maintenanceService.getById(req.params.id);
  sendSuccess(res, { message: 'Maintenance request fetched', data });
});

const startRepair = catchAsync(async (req, res) => {
  const data = await maintenanceService.startRepair(req.params.id, req.body);
  sendSuccess(res, { message: 'Repair started', data });
});

const completeRepair = catchAsync(async (req, res) => {
  // completedBy is always the logged-in manager.
  const data = await maintenanceService.completeRepair(req.params.id, req.body, req.manager._id);
  sendSuccess(res, { message: 'Repair completed', data });
});

module.exports = { list, technicians, getById, startRepair, completeRepair };
