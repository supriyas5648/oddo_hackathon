import api from '../lib/axios';

export async function fetchMaintenance(params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const { data } = await api.get('/maintenance', { params: clean });
  return { items: data.data, meta: data.meta };
}

export async function fetchTechnicians() {
  const { data } = await api.get('/maintenance/technicians');
  return data.data; // string[]
}

export async function startRepair(id, payload) {
  const { data } = await api.patch(`/maintenance/${id}/start`, payload);
  return data.data;
}

export async function completeRepair(id, payload) {
  const { data } = await api.patch(`/maintenance/${id}/complete`, payload);
  return data.data;
}
