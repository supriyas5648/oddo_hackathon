const assetService = require('../services/asset.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const create = catchAsync(async (req, res) => {
  const data = await assetService.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Asset created', data });
});

const list = catchAsync(async (req, res) => {
  const { results, meta } = await assetService.list(req.query);
  sendSuccess(res, { message: 'Assets fetched', data: results, meta });
});

const stats = catchAsync(async (req, res) => {
  const data = await assetService.stats();
  sendSuccess(res, { message: 'Asset statistics fetched', data });
});

const getById = catchAsync(async (req, res) => {
  const data = await assetService.getById(req.params.id);
  sendSuccess(res, { message: 'Asset fetched', data });
});

const lifecycle = catchAsync(async (req, res) => {
  const data = await assetService.lifecycle(req.params.id);
  sendSuccess(res, { message: 'Asset lifecycle fetched', data });
});

const update = catchAsync(async (req, res) => {
  const data = await assetService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'Asset updated', data });
});

const remove = catchAsync(async (req, res) => {
  const data = await assetService.remove(req.params.id);
  sendSuccess(res, { message: 'Asset disposed', data });
});

module.exports = { create, list, stats, getById, lifecycle, update, remove };
