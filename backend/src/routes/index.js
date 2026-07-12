const express = require('express');
const departmentRoutes = require('./department.routes');
const categoryRoutes = require('./category.routes');
const employeeRoutes = require('./employee.routes');
const assetRoutes = require('./asset.routes');
const allocationRoutes = require('./allocation.routes');
const maintenanceRoutes = require('./maintenance.routes');
const authRoutes = require('./auth.routes');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// API index / discoverability.
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AssetFlow API v1',
    resources: {
      auth: '/api/v1/auth',
      departments: '/api/v1/departments',
      categories: '/api/v1/categories',
      employees: '/api/v1/employees',
      assets: '/api/v1/assets',
      allocations: '/api/v1/allocations',
      maintenance: '/api/v1/maintenance',
    },
  });
});

// Auth is public at the edges (login); logout/me self-guard.
router.use('/auth', authRoutes);

// Everything below requires an authenticated manager session.
router.use('/departments', protect, departmentRoutes);
router.use('/categories', protect, categoryRoutes);
router.use('/employees', protect, employeeRoutes);
router.use('/assets', protect, assetRoutes);
router.use('/allocations', protect, allocationRoutes);
router.use('/maintenance', protect, maintenanceRoutes);

module.exports = router;
