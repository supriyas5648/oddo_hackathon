const Joi = require('joi');
const { idParam, paginationQuery } = require('./common.validation');

const STATUS = ['Pending', 'In Progress', 'Completed'];
const COMPLETED_CONDITION = ['Excellent', 'Good', 'Fair'];

const listMaintenance = {
  query: paginationQuery.keys({
    status: Joi.string().valid(...STATUS),
    technician: Joi.string().trim().max(120),
  }),
};

const maintenanceId = { params: idParam };

const startRepair = {
  params: idParam,
  body: Joi.object({
    technicianName: Joi.string().trim().min(2).max(120).required(),
    estimatedRepairCost: Joi.number().min(0),
    repairNotes: Joi.string().trim().allow('').max(1000),
  }),
};

const completeRepair = {
  params: idParam,
  body: Joi.object({
    repairCost: Joi.number().min(0),
    resolution: Joi.string().trim().allow('').max(1000),
    assetCondition: Joi.string()
      .valid(...COMPLETED_CONDITION)
      .required()
      .label('assetCondition'),
    remarks: Joi.string().trim().allow('').max(1000),
  }),
};

module.exports = { listMaintenance, maintenanceId, startRepair, completeRepair };
