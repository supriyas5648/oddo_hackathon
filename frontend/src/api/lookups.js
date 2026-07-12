import api from '../lib/axios';

// Lookups for the form/filter dropdowns. We request a large page since these
// reference lists are small; swap to a typeahead if they ever grow.

export async function fetchCategories() {
  const { data } = await api.get('/categories', { params: { limit: 100, sort: 'name' } });
  return data.data;
}

export async function fetchDepartments() {
  // Load ALL departments (not just Active) so the Asset form/filter dropdowns
  // include every department — including any inserted directly in the DB that
  // lack the Mongoose "Active" default.
  const { data } = await api.get('/departments', {
    params: { limit: 100, sort: 'name' },
  });
  return data.data;
}

// Active employees eligible to receive an allocation.
export async function fetchEmployees() {
  const { data } = await api.get('/employees', {
    params: { limit: 100, sort: 'name', status: 'Active' },
  });
  return data.data;
}
