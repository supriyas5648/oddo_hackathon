const express = require('express');
const controller = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const v = require('../validations/user.validation');

const router = express.Router();

router
  .route('/')
  .get(validate(v.listUsers), controller.list)
  .post(validate(v.createUser), controller.create);

router
  .route('/:id')
  .get(validate(v.userId), controller.getById)
  .patch(validate(v.updateUser), controller.update)
  .delete(validate(v.userId), controller.remove);

module.exports = router;
