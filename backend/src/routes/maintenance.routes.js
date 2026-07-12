const express = require('express');
const controller = require('../controllers/maintenance.controller');
const validate = require('../middlewares/validate');
const v = require('../validations/maintenance.validation');

const router = express.Router();

router.get('/', validate(v.listMaintenance), controller.list);

// Distinct technician names for the filter dropdown.
// Declared before '/:id' so "technicians" isn't matched as an id.
router.get('/technicians', controller.technicians);

router.get('/:id', validate(v.maintenanceId), controller.getById);

// Workflow transitions.
router.patch('/:id/start', validate(v.startRepair), controller.startRepair);
router.patch('/:id/complete', validate(v.completeRepair), controller.completeRepair);

module.exports = router;
