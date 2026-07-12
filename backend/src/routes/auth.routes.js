const express = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const v = require('../validations/auth.validation');

const router = express.Router();

// Public: open a session.
router.post('/login', validate(v.login), controller.login);

// Protected: require a valid session.
router.post('/logout', protect, controller.logout);
router.get('/me', protect, controller.me);

module.exports = router;
