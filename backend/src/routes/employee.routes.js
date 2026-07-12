const express = require('express');
const controller = require('../controllers/employee.controller');
const validate = require('../middlewares/validate');
const v = require('../validations/employee.validation');

const router = express.Router();

router
  .route('/')
  .get(validate(v.listEmployees), controller.list)
  .post(validate(v.createEmployee), controller.create);

router
  .route('/:id')
  .get(validate(v.employeeId), controller.getById)
  .patch(validate(v.updateEmployee), controller.update)
  .delete(validate(v.employeeId), controller.remove);

module.exports = router;
