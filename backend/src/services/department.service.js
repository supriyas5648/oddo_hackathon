const mongoose = require('mongoose');
const Department = require('../models/department.model');
const Employee = require('../models/employee.model');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/queryFeatures');

const POPULATE = [
  { path: 'parentDepartment', select: 'name code' },
  { path: 'departmentHead', select: 'name email designation' },
];

/** Ensure a referenced parent department exists (when provided). */
async function assertParentExists(parentId) {
  if (!parentId) return;
  const parent = await Department.findById(parentId).select('_id');
  if (!parent) throw ApiError.badRequest('parentDepartment does not reference an existing department');
}

/** Ensure a referenced department head is a real employee (when provided). */
async function assertHeadExists(headId) {
  if (!headId) return;
  const employee = await Employee.findById(headId).select('_id');
  if (!employee) throw ApiError.badRequest('departmentHead does not reference an existing employee');
}

/**
 * Prevent hierarchy cycles: a department cannot be its own ancestor.
 * Walks up the proposed parent chain looking for `departmentId`.
 */
async function assertNoCycle(departmentId, parentId) {
  if (!parentId) return;
  if (String(departmentId) === String(parentId)) {
    throw ApiError.badRequest('A department cannot be its own parent');
  }

  let cursor = parentId;
  const visited = new Set([String(departmentId)]);

  while (cursor) {
    const key = String(cursor);
    if (visited.has(key)) {
      throw ApiError.badRequest('Circular department hierarchy detected');
    }
    visited.add(key);
    // eslint-disable-next-line no-await-in-loop
    const node = await Department.findById(cursor).select('parentDepartment').lean();
    if (!node) break;
    cursor = node.parentDepartment;
  }
}

async function create(payload) {
  await Promise.all([
    assertParentExists(payload.parentDepartment),
    assertHeadExists(payload.departmentHead),
  ]);
  const department = await Department.create(payload);
  return department.populate(POPULATE);
}

async function list(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.parentDepartment) filter.parentDepartment = query.parentDepartment;

  return paginate(Department, {
    filter,
    search: query.search,
    searchFields: ['name', 'code', 'description'],
    sort: query.sort,
    page: query.page,
    limit: query.limit,
    populate: POPULATE,
  });
}

async function getById(id) {
  const department = await Department.findById(id)
    .populate(POPULATE)
    .populate({ path: 'subDepartments', select: 'name code status' });
  if (!department) throw ApiError.notFound('Department not found');
  return department;
}

async function update(id, payload) {
  const existing = await Department.findById(id);
  if (!existing) throw ApiError.notFound('Department not found');

  if (payload.parentDepartment !== undefined) {
    await assertParentExists(payload.parentDepartment);
    await assertNoCycle(id, payload.parentDepartment);
  }
  if (payload.departmentHead !== undefined) {
    await assertHeadExists(payload.departmentHead);
  }

  Object.assign(existing, payload);
  await existing.save();
  return existing.populate(POPULATE);
}

async function remove(id) {
  const department = await Department.findById(id);
  if (!department) throw ApiError.notFound('Department not found');

  // Referential-integrity guards: block deletion if it would orphan data.
  const [childCount, employeeCount] = await Promise.all([
    Department.countDocuments({ parentDepartment: id }),
    Employee.countDocuments({ department: id }),
  ]);

  if (childCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: ${childCount} sub-department(s) reference this department`
    );
  }
  if (employeeCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: ${employeeCount} employee(s) are assigned to this department`
    );
  }

  await department.deleteOne();
  return { id };
}

/** Build a nested tree of all departments (roots -> children). */
async function tree() {
  const all = await Department.find()
    .select('name code status parentDepartment')
    .sort('name')
    .lean();

  const byId = new Map(all.map((d) => [String(d._id), { ...d, children: [] }]));
  const roots = [];

  byId.forEach((node) => {
    const parentKey = node.parentDepartment ? String(node.parentDepartment) : null;
    if (parentKey && byId.has(parentKey)) {
      byId.get(parentKey).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

module.exports = { create, list, getById, update, remove, tree };
