const express = require('express');
const controller = require('../controllers/department.controller');
const validate = require('../middlewares/validate');
const v = require('../validations/department.validation');

const router = express.Router();

router
  .route('/')
  .get(validate(v.listDepartments), controller.list)
  .post(validate(v.createDepartment), controller.create);

// Full hierarchy as a nested tree.
router.get('/tree', controller.tree);

router
  .route('/:id')
  .get(validate(v.departmentId), controller.getById)
  .patch(validate(v.updateDepartment), controller.update)
  .delete(validate(v.departmentId), controller.remove);

module.exports = router;
