const Joi = require('joi');

// Reusable Joi rule for a 24-char hex Mongo ObjectId.
const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .message('{#label} must be a valid ObjectId');

// Shared `:id` path param schema.
const idParam = Joi.object({
  id: objectId.required().label('id'),
});

// Shared list/pagination query schema. Individual resources extend this.
const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().default('-createdAt'),
  search: Joi.string().trim().allow('').max(120),
});

module.exports = { objectId, idParam, paginationQuery };
