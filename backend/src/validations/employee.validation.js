const Joi = require('joi');
const { objectId, idParam, paginationQuery } = require('./common.validation');

const STATUS = ['Active', 'Inactive'];

const createEmployee = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: Joi.string().trim().lowercase().email().required(),
    designation: Joi.string().trim().allow('').max(120),
    department: objectId.allow(null).label('department'),
    status: Joi.string().valid(...STATUS),
  }),
};

const updateEmployee = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120),
    email: Joi.string().trim().lowercase().email(),
    designation: Joi.string().trim().allow('').max(120),
    department: objectId.allow(null).label('department'),
    status: Joi.string().valid(...STATUS),
  })
    .min(1)
    .message('At least one field must be provided to update'),
};

const listEmployees = {
  query: paginationQuery.keys({
    status: Joi.string().valid(...STATUS),
    department: objectId.label('department'),
  }),
};

const employeeId = { params: idParam };

module.exports = { createEmployee, updateEmployee, listEmployees, employeeId };
