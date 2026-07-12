/**
 * Seed script: wipes and repopulates the org-setup collections with a
 * small, realistic dataset. Run with `npm run seed`.
 *
 * ⚠️  Destructive — intended for local/dev only.
 */
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./db');
const Department = require('../models/department.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');

async function seed() {
  await connectDB();
  // eslint-disable-next-line no-console
  console.log('🌱 Seeding database...');

  await Promise.all([
    Department.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({}),
  ]);

  // Departments (parent first, then children referencing it).
  const it = await Department.create({ name: 'Information Technology', code: 'IT' });
  const ops = await Department.create({ name: 'Operations', code: 'OPS' });
  await Department.create({
    name: 'Infrastructure',
    code: 'INFRA',
    parentDepartment: it._id,
  });

  // Users (.create in series so the password-hash hook runs on each).
  const admin = await User.create({
    name: 'Alice Admin',
    email: 'alice@assetflow.io',
    password: 'secret123',
    role: 'Admin',
    department: it._id,
  });
  await User.create({
    name: 'Bob Manager',
    email: 'bob@assetflow.io',
    password: 'secret123',
    role: 'Asset Manager',
    department: ops._id,
  });

  // Assign a department head now that a user exists.
  it.departmentHead = admin._id;
  await it.save();

  // Categories.
  await Category.insertMany([
    { name: 'Laptops', icon: 'laptop', requiresWarranty: true },
    { name: 'Vehicles', icon: 'car', requiresWarranty: true, isSharedResource: true },
    { name: 'Meeting Rooms', icon: 'door', isSharedResource: true },
  ]);

  const counts = {
    departments: await Department.countDocuments(),
    users: await User.countDocuments(),
    categories: await Category.countDocuments(),
  };
  // eslint-disable-next-line no-console
  console.log('✅ Seed complete:', counts);

  await disconnectDB();
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
