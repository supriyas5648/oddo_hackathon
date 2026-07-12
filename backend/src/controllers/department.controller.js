const departmentService = require('../services/department.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const create = catchAsync(async (req, res) => {
  const data = await departmentService.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Department created', data });
});

const list = catchAsync(async (req, res) => {
  const { results, meta } = await departmentService.list(req.query);
  sendSuccess(res, { message: 'Departments fetched', data: results, meta });
});

const tree = catchAsync(async (req, res) => {
  const data = await departmentService.tree();
  sendSuccess(res, { message: 'Department tree fetched', data });
});

const getById = catchAsync(async (req, res) => {
  const data = await departmentService.getById(req.params.id);
  sendSuccess(res, { message: 'Department fetched', data });
});

const update = catchAsync(async (req, res) => {
  const data = await departmentService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'Department updated', data });
});

const remove = catchAsync(async (req, res) => {
  const data = await departmentService.remove(req.params.id);
  sendSuccess(res, { message: 'Department deleted', data });
});

module.exports = { create, list, tree, getById, update, remove };
