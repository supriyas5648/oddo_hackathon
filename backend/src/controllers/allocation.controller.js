const allocationService = require('../services/allocation.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const create = catchAsync(async (req, res) => {
  // allocatedBy is always the logged-in manager — never taken from the client.
  const data = await allocationService.create(req.body, req.manager._id);
  sendSuccess(res, { statusCode: 201, message: 'Asset allocated', data });
});

const returnAsset = catchAsync(async (req, res) => {
  // returnedBy is always the logged-in manager.
  const data = await allocationService.returnAsset(req.params.id, req.body, req.manager._id);
  sendSuccess(res, { message: 'Asset returned', data });
});

const list = catchAsync(async (req, res) => {
  const { results, meta } = await allocationService.list(req.query);
  sendSuccess(res, { message: 'Allocations fetched', data: results, meta });
});

const getById = catchAsync(async (req, res) => {
  const data = await allocationService.getById(req.params.id);
  sendSuccess(res, { message: 'Allocation fetched', data });
});

const getByAsset = catchAsync(async (req, res) => {
  const { results, meta } = await allocationService.getByAsset(req.params.assetId, req.query);
  sendSuccess(res, { message: 'Asset allocations fetched', data: results, meta });
});

const getByEmployee = catchAsync(async (req, res) => {
  const { results, meta } = await allocationService.getByEmployee(req.params.employeeId, req.query);
  sendSuccess(res, { message: 'Employee allocations fetched', data: results, meta });
});

module.exports = { create, returnAsset, list, getById, getByAsset, getByEmployee };
