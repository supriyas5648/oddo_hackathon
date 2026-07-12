const Joi = require('joi');
const { objectId, idParam, paginationQuery } = require('./common.validation');

const STATUS = ['Active', 'Inactive'];

const createDepartment = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    code: Joi.string().trim().uppercase().max(20).required(),
    description: Joi.string().trim().allow('').max(500),
    parentDepartment: objectId.allow(null).label('parentDepartment'),
    departmentHead: objectId.allow(null).label('departmentHead'),
    status: Joi.string().valid(...STATUS),
  }),
};

const updateDepartment = {
  params: idParam,
  // At least one updatable field must be present.
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120),
    code: Joi.string().trim().uppercase().max(20),
    description: Joi.string().trim().allow('').max(500),
    parentDepartment: objectId.allow(null).label('parentDepartment'),
    departmentHead: objectId.allow(null).label('departmentHead'),
    status: Joi.string().valid(...STATUS),
  })
    .min(1)
    .message('At least one field must be provided to update'),
};

const listDepartments = {
  query: paginationQuery.keys({
    status: Joi.string().valid(...STATUS),
    parentDepartment: objectId.label('parentDepartment'),
  }),
};

const departmentId = { params: idParam };

module.exports = {
  createDepartment,
  updateDepartment,
  listDepartments,
  departmentId,
};
