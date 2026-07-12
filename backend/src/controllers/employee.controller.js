const employeeService = require('../services/employee.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const create = catchAsync(async (req, res) => {
  const data = await employeeService.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Employee created', data });
});

const list = catchAsync(async (req, res) => {
  const { results, meta } = await employeeService.list(req.query);
  sendSuccess(res, { message: 'Employees fetched', data: results, meta });
});

const getById = catchAsync(async (req, res) => {
  const data = await employeeService.getById(req.params.id);
  sendSuccess(res, { message: 'Employee fetched', data });
});

const update = catchAsync(async (req, res) => {
  const data = await employeeService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'Employee updated', data });
});

const remove = catchAsync(async (req, res) => {
  const data = await employeeService.remove(req.params.id);
  sendSuccess(res, { message: 'Employee deleted', data });
});

module.exports = { create, list, getById, update, remove };
