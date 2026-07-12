const express = require('express');
const departmentRoutes = require('./department.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');
const assetRoutes = require('./asset.routes');
const allocationRoutes = require('./allocation.routes');

const router = express.Router();

// API index / discoverability.
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AssetFlow API v1',
    resources: {
      departments: '/api/v1/departments',
      categories: '/api/v1/categories',
      users: '/api/v1/users',
      assets: '/api/v1/assets',
      allocations: '/api/v1/allocations',
    },
  });
});

router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/assets', assetRoutes);
router.use('/allocations', allocationRoutes);

module.exports = router;
