const Joi = require('joi');
const { idParam, paginationQuery } = require('./common.validation');

const createCategory = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    description: Joi.string().trim().allow('').max(500),
    icon: Joi.string().trim().allow('').max(200),
    isSharedResource: Joi.boolean(),
    requiresWarranty: Joi.boolean(),
  }),
};

const updateCategory = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120),
    description: Joi.string().trim().allow('').max(500),
    icon: Joi.string().trim().allow('').max(200),
    isSharedResource: Joi.boolean(),
    requiresWarranty: Joi.boolean(),
  })
    .min(1)
    .message('At least one field must be provided to update'),
};

const listCategories = {
  query: paginationQuery.keys({
    isSharedResource: Joi.boolean(),
    requiresWarranty: Joi.boolean(),
  }),
};

const categoryId = { params: idParam };

module.exports = { createCategory, updateCategory, listCategories, categoryId };
