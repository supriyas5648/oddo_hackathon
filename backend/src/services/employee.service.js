const Employee = require('../models/employee.model');
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
  const employee = await Employee.create(payload);
  return employee.populate(POPULATE);
}

async function list(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;

  return paginate(Employee, {
    filter,
    search: query.search,
    searchFields: ['name', 'email', 'designation'],
    sort: query.sort,
    page: query.page,
    limit: query.limit,
    populate: POPULATE,
  });
}

async function getById(id) {
  const employee = await Employee.findById(id).populate(POPULATE);
  if (!employee) throw ApiError.notFound('Employee not found');
  return employee;
}

async function update(id, payload) {
  if (payload.department !== undefined) {
    await assertDepartmentExists(payload.department);
  }
  const employee = await Employee.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate(POPULATE);
  if (!employee) throw ApiError.notFound('Employee not found');
  return employee;
}

async function remove(id) {
  const employee = await Employee.findById(id);
  if (!employee) throw ApiError.notFound('Employee not found');

  // Detach this employee from any department they head to avoid dangling refs.
  await Department.updateMany({ departmentHead: id }, { $set: { departmentHead: null } });

  await employee.deleteOne();
  return { id };
}

module.exports = { create, list, getById, update, remove };
