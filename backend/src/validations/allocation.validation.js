const Joi = require('joi');
const { objectId, idParam, paginationQuery } = require('./common.validation');

const STATUS = ['Active', 'Returned', 'Cancelled'];
const CONDITION = ['Excellent', 'Good', 'Fair', 'Damaged'];

const createAllocation = {
  body: Joi.object({
    asset: objectId.required().label('asset'),
    employee: objectId.required().label('employee'),
    allocatedBy: objectId.allow(null).label('allocatedBy'),
    allocationDate: Joi.date().iso(),
    // Expected return must not predate the allocation date — but only enforce
    // that when allocationDate is actually provided (it defaults to now in the
    // model, so it's usually absent from the request body).
    expectedReturnDate: Joi.when('allocationDate', {
      is: Joi.exist(),
      then: Joi.date().iso().min(Joi.ref('allocationDate')).messages({
        'date.min': 'expectedReturnDate cannot be before allocationDate',
      }),
      otherwise: Joi.date().iso(),
    }),
    purpose: Joi.string().trim().allow('').max(300),
    remarks: Joi.string().trim().allow('').max(500),
  }),
};

const returnAllocation = {
  params: idParam,
  body: Joi.object({
    returnCondition: Joi.string()
      .valid(...CONDITION)
      .required()
      .label('returnCondition'),
    returnDate: Joi.date().iso(),
    returnRemarks: Joi.string().trim().allow('').max(500),
  }),
};

const listAllocations = {
  query: paginationQuery.keys({
    status: Joi.string().valid(...STATUS),
    asset: objectId.label('asset'),
    employee: objectId.label('employee'),
  }),
};

const allocationId = { params: idParam };

const byAsset = {
  params: Joi.object({ assetId: objectId.required().label('assetId') }),
  query: paginationQuery.keys({ status: Joi.string().valid(...STATUS) }),
};

const byEmployee = {
  params: Joi.object({ employeeId: objectId.required().label('employeeId') }),
  query: paginationQuery.keys({ status: Joi.string().valid(...STATUS) }),
};

module.exports = {
  createAllocation,
  returnAllocation,
  listAllocations,
  allocationId,
  byAsset,
  byEmployee,
};
