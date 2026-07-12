const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const create = catchAsync(async (req, res) => {
  const data = await userService.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'User created', data });
});

const list = catchAsync(async (req, res) => {
  const { results, meta } = await userService.list(req.query);
  sendSuccess(res, { message: 'Users fetched', data: results, meta });
});

const getById = catchAsync(async (req, res) => {
  const data = await userService.getById(req.params.id);
  sendSuccess(res, { message: 'User fetched', data });
});

const update = catchAsync(async (req, res) => {
  const data = await userService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'User updated', data });
});

const remove = catchAsync(async (req, res) => {
  const data = await userService.remove(req.params.id);
  sendSuccess(res, { message: 'User deleted', data });
});

module.exports = { create, list, getById, update, remove };
