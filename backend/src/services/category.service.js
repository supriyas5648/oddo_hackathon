const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/queryFeatures');

async function create(payload) {
  return Category.create(payload);
}

async function list(query) {
  const filter = {};
  if (query.isSharedResource !== undefined) filter.isSharedResource = query.isSharedResource;
  if (query.requiresWarranty !== undefined) filter.requiresWarranty = query.requiresWarranty;

  return paginate(Category, {
    filter,
    search: query.search,
    searchFields: ['name', 'description'],
    sort: query.sort,
    page: query.page,
    limit: query.limit,
  });
}

async function getById(id) {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

async function update(id, payload) {
  const category = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

async function remove(id) {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw ApiError.notFound('Category not found');
  return { id };
}

module.exports = { create, list, getById, update, remove };
