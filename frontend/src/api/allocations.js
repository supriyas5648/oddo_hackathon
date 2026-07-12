import api from '../lib/axios';

// Allocation endpoints. Each returns plain data for the React Query hooks.

export async function createAllocation(payload) {
  const { data } = await api.post('/allocations', payload);
  return data.data;
}

export async function fetchAllocations(params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const { data } = await api.get('/allocations', { params: clean });
  return { items: data.data, meta: data.meta };
}

export async function returnAllocation(id, payload) {
  const { data } = await api.patch(`/allocations/${id}/return`, payload);
  return data.data;
}

export async function fetchAllocation(id) {
  const { data } = await api.get(`/allocations/${id}`);
  return data.data;
}

export async function fetchAssetAllocations(assetId, params = {}) {
  const { data } = await api.get(`/allocations/asset/${assetId}`, { params });
  return { items: data.data, meta: data.meta };
}

export async function fetchEmployeeAllocations(employeeId, params = {}) {
  const { data } = await api.get(`/allocations/employee/${employeeId}`, { params });
  return { items: data.data, meta: data.meta };
}
