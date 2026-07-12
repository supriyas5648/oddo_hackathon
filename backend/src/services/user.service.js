const User = require('../models/user.model');
const Department = require('../models/department.model');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/queryFeatures');

const POPULATE = [{ path: 'department', select: 'name code status' }];

/** Ensure a referenced department exists (when provided). */
async function assertDepartmentExists(departmentId) {
  if (!departmentId) return;
  const dept = await Department.findById(departmentId).select('_id');
  if (!dept) throw ApiError.badRequest('department does not reference an existing department');
}

async function create(payload) {
  await assertDepartmentExists(payload.department);
  // Use .create() (not insertMany) so the pre-save password hook runs.
  const user = await User.create(payload);
  return user.populate(POPULATE);
}

async function list(query) {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;

  return paginate(User, {
    filter,
    search: query.search,
    searchFields: ['name', 'email'],
    sort: query.sort,
    page: query.page,
    limit: query.limit,
    populate: POPULATE,
  });
}

async function getById(id) {
  const user = await User.findById(id).populate(POPULATE);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function update(id, payload) {
  const user = await User.findById(id).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  if (payload.department !== undefined) {
    await assertDepartmentExists(payload.department);
  }

  // Assign field-by-field so the pre-save hook re-hashes a changed password.
  Object.assign(user, payload);
  await user.save();
  return user.populate(POPULATE);
}

async function remove(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  // Detach this user from any department they head to avoid dangling refs.
  await Department.updateMany({ departmentHead: id }, { $set: { departmentHead: null } });

  await user.deleteOne();
  return { id };
}

module.exports = { create, list, getById, update, remove };
