const categoryService = require('../services/category.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const create = catchAsync(async (req, res) => {
  const data = await categoryService.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Category created', data });
});

const list = catchAsync(async (req, res) => {
  const { results, meta } = await categoryService.list(req.query);
  sendSuccess(res, { message: 'Categories fetched', data: results, meta });
});

const getById = catchAsync(async (req, res) => {
  const data = await categoryService.getById(req.params.id);
  sendSuccess(res, { message: 'Category fetched', data });
});

const update = catchAsync(async (req, res) => {
  const data = await categoryService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'Category updated', data });
});

const remove = catchAsync(async (req, res) => {
  const data = await categoryService.remove(req.params.id);
  sendSuccess(res, { message: 'Category deleted', data });
});

module.exports = { create, list, getById, update, remove };
