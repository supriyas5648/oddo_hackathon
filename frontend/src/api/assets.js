import api from '../lib/axios';

// Thin API layer: one function per endpoint. Each returns plain data so
// React Query hooks stay declarative.

export async function fetchAssets(params = {}) {
  // Drop empty/undefined params so we don't send ?status=&category= etc.
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const { data } = await api.get('/assets', { params: clean });
  return { items: data.data, meta: data.meta };
}

export async function fetchAssetStats() {
  const { data } = await api.get('/assets/stats');
  return data.data; // { total, byStatus: { Available, Allocated, ... } }
}

export async function fetchAsset(id) {
  const { data } = await api.get(`/assets/${id}`);
  return data.data;
}

export async function fetchAssetLifecycle(id) {
  const { data } = await api.get(`/assets/${id}/lifecycle`);
  return data.data; // { asset, events: [{ type, title, date, ... }] }
}

export async function createAsset(payload) {
  const { data } = await api.post('/assets', payload);
  return data.data;
}

export async function updateAsset(id, payload) {
  const { data } = await api.put(`/assets/${id}`, payload);
  return data.data;
}

export async function deleteAsset(id) {
  const { data } = await api.delete(`/assets/${id}`);
  return data.data;
}
