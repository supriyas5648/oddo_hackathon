const Joi = require('joi');
const { objectId, idParam, paginationQuery } = require('./common.validation');

const CONDITION = ['Excellent', 'Good', 'Fair', 'Damaged'];
const STATUS = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

const documentItem = Joi.object({
  name: Joi.string().trim().max(150).required(),
  url: Joi.string().trim().uri({ allowRelative: true }).required(),
});

const createAsset = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),
    serialNumber: Joi.string().trim().min(1).max(120).required(),
    category: objectId.required().label('category'),
    department: objectId.required().label('department'),
    location: Joi.string().trim().allow('').max(200),
    purchaseDate: Joi.date().iso(),
    purchaseCost: Joi.number().min(0),
    // Warranty must not predate purchase — only enforced when purchaseDate is
    // provided (otherwise the ref resolves to undefined and Joi errors).
    warrantyExpiry: Joi.when('purchaseDate', {
      is: Joi.exist(),
      then: Joi.date().iso().min(Joi.ref('purchaseDate')).messages({
        'date.min': 'warrantyExpiry cannot be before purchaseDate',
      }),
      otherwise: Joi.date().iso(),
    }),
    condition: Joi.string().valid(...CONDITION),
    status: Joi.string().valid(...STATUS),
    isBookable: Joi.boolean(),
    image: Joi.string().trim().uri({ allowRelative: true }).allow(''),
    documents: Joi.array().items(documentItem),
    // createdBy is NOT accepted from the client — it's the logged-in manager.
  }),
};

const updateAsset = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150),
    serialNumber: Joi.string().trim().min(1).max(120),
    category: objectId.label('category'),
    department: objectId.label('department'),
    location: Joi.string().trim().allow('').max(200),
    purchaseDate: Joi.date().iso(),
    purchaseCost: Joi.number().min(0),
    warrantyExpiry: Joi.date().iso(),
    condition: Joi.string().valid(...CONDITION),
    status: Joi.string().valid(...STATUS),
    isBookable: Joi.boolean(),
    image: Joi.string().trim().uri({ allowRelative: true }).allow(''),
    documents: Joi.array().items(documentItem),
  })
    .min(1)
    .message('At least one field must be provided to update'),
};

const listAssets = {
  query: paginationQuery.keys({
    status: Joi.string().valid(...STATUS),
    condition: Joi.string().valid(...CONDITION),
    department: objectId.label('department'),
    category: objectId.label('category'),
    isBookable: Joi.boolean(),
    includeDisposed: Joi.boolean(),
  }),
};

const assetId = { params: idParam };

module.exports = { createAsset, updateAsset, listAssets, assetId };
