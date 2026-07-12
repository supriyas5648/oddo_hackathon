const Joi = require('joi');
const { objectId, idParam, paginationQuery } = require('./common.validation');

const ROLES = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];
const STATUS = ['Active', 'Inactive'];

const createUser = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).max(128).required(),
    department: objectId.allow(null).label('department'),
    role: Joi.string().valid(...ROLES),
    status: Joi.string().valid(...STATUS),
  }),
};

const updateUser = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120),
    email: Joi.string().trim().lowercase().email(),
    password: Joi.string().min(6).max(128),
    department: objectId.allow(null).label('department'),
    role: Joi.string().valid(...ROLES),
    status: Joi.string().valid(...STATUS),
  })
    .min(1)
    .message('At least one field must be provided to update'),
};

const listUsers = {
  query: paginationQuery.keys({
    role: Joi.string().valid(...ROLES),
    status: Joi.string().valid(...STATUS),
    department: objectId.label('department'),
  }),
};

const userId = { params: idParam };

module.exports = { createUser, updateUser, listUsers, userId };
