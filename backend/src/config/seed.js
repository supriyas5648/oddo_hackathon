/**
 * Seed script: wipes and repopulates the collections with a small, realistic
 * dataset. Run with `npm run seed`.
 *
 * ⚠️  Destructive — intended for local/dev only.
 *
 * Creates login-capable Managers and non-login Employees.
 */
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./db');
const Department = require('../models/department.model');
const Category = require('../models/category.model');
const Employee = require('../models/employee.model');
const Manager = require('../models/manager.model');
const SystemState = require('../models/systemState.model');

async function seed() {
  await connectDB();
  // eslint-disable-next-line no-console
  console.log('🌱 Seeding database...');

  await Promise.all([
    Department.deleteMany({}),
    Category.deleteMany({}),
    Employee.deleteMany({}),
    Manager.deleteMany({}),
    SystemState.deleteMany({}),
  ]);

  // Ensure the Manager unique-email index exists (safe in non-prod autoIndex).
  await Manager.syncIndexes();

  // Departments (parent first, then children referencing it).
  const it = await Department.create({ name: 'Information Technology', code: 'IT' });
  const ops = await Department.create({ name: 'Operations', code: 'OPS' });
  await Department.create({ name: 'Infrastructure', code: 'INFRA', parentDepartment: it._id });

  // Managers — the only accounts that can log in (.create so hashing runs).
  await Manager.create({
    fullName: 'Alice Admin',
    email: 'alice@assetflow.io',
    password: 'secret123',
    role: 'Admin',
  });
  await Manager.create({
    fullName: 'Bob Manager',
    email: 'bob@assetflow.io',
    password: 'secret123',
    role: 'Manager',
  });

  // Employees — cannot log in; used for allocation / history / transfers.
  const supriya = await Employee.create({
    name: 'Supriya Sharma',
    email: 'supriya@assetflow.io',
    designation: 'Software Engineer',
    department: it._id,
  });
  await Employee.create({
    name: 'Rahul Verma',
    email: 'rahul@assetflow.io',
    designation: 'Operations Lead',
    department: ops._id,
  });

  // Assign a department head (an employee).
  it.departmentHead = supriya._id;
  await it.save();

  // Categories.
  await Category.insertMany([
    { name: 'Laptops', icon: 'laptop', requiresWarranty: true },
    { name: 'Vehicles', icon: 'car', requiresWarranty: true, isSharedResource: true },
    { name: 'Meeting Rooms', icon: 'door', isSharedResource: true },
  ]);

  const counts = {
    departments: await Department.countDocuments(),
    managers: await Manager.countDocuments(),
    employees: await Employee.countDocuments(),
    categories: await Category.countDocuments(),
  };
  // eslint-disable-next-line no-console
  console.log('✅ Seed complete:', counts);
  // eslint-disable-next-line no-console
  console.log('🔑 Login with: alice@assetflow.io / secret123  (or bob@assetflow.io / secret123)');

  await disconnectDB();
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
