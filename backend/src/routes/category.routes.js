const express = require('express');
const controller = require('../controllers/category.controller');
const validate = require('../middlewares/validate');
const v = require('../validations/category.validation');

const router = express.Router();

router
  .route('/')
  .get(validate(v.listCategories), controller.list)
  .post(validate(v.createCategory), controller.create);

router
  .route('/:id')
  .get(validate(v.categoryId), controller.getById)
  .patch(validate(v.updateCategory), controller.update)
  .delete(validate(v.categoryId), controller.remove);

module.exports = router;
