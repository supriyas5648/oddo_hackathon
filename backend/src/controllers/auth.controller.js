const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const login = catchAsync(async (req, res) => {
  const { token, manager } = await authService.login(req.body);
  sendSuccess(res, { message: 'Login successful', data: { token, manager } });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.manager);
  sendSuccess(res, { message: 'Logout successful', data: null });
});

// req.manager is set by the `protect` middleware.
const me = catchAsync(async (req, res) => {
  sendSuccess(res, { message: 'Current manager', data: req.manager });
});

module.exports = { login, logout, me };
