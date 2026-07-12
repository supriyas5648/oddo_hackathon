const express = require('express');
const controller = require('../controllers/allocation.controller');
const validate = require('../middlewares/validate');
const v = require('../validations/allocation.validation');

const router = express.Router();

router
  .route('/')
  .get(validate(v.listAllocations), controller.list)
  .post(validate(v.createAllocation), controller.create);

// Scoped lookups. Declared before '/:id' so their static prefixes
// ("asset", "employee") are never matched as an allocation id.
router.get('/asset/:assetId', validate(v.byAsset), controller.getByAsset);
router.get('/employee/:employeeId', validate(v.byEmployee), controller.getByEmployee);

// Return (check in) an active allocation.
router.patch('/:id/return', validate(v.returnAllocation), controller.returnAsset);

router.route('/:id').get(validate(v.allocationId), controller.getById);

module.exports = router;
