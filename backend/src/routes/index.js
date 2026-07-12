const express = require('express');
const departmentRoutes = require('./department.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// API index / discoverability.
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AssetFlow API v1 — Organization Setup',
    resources: {
      departments: '/api/v1/departments',
      categories: '/api/v1/categories',
      users: '/api/v1/users',
    },
  });
});

router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

module.exports = router;
