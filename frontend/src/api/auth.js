import api from '../lib/axios';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data; // { token, manager }
}

export async function logout() {
  const { data } = await api.post('/auth/logout');
  return data.data;
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data.data; // manager
}
