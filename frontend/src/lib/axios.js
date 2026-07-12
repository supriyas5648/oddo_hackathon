import axios from 'axios';
import { getToken, clearToken } from './token';

// Central Axios instance. Base URL comes from env; in dev the Vite proxy
// forwards /api to the backend so there is no CORS to deal with.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach the Manager session token to every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the API envelope ({ success, message, data, meta }) and normalize
// errors into a single Error with a friendly `.message` the UI can toast.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const res = error.response;
    let message = 'Something went wrong. Please try again.';
    if (res?.data?.message) message = res.data.message;
    else if (error.code === 'ECONNABORTED') message = 'Request timed out.';
    else if (!res) message = 'Cannot reach the server. Is the backend running?';

    // Session ended / token invalid on a protected call (but NOT a failed
    // login attempt). Clear the token and let the app react to re-auth.
    const isLogin = (error.config?.url || '').includes('/auth/login');
    if (res?.status === 401 && !isLogin) {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { message } }));
    }

    const normalized = new Error(message);
    normalized.status = res?.status;
    normalized.fieldErrors = res?.data?.errors || null; // [{ field, message }]
    return Promise.reject(normalized);
  }
);

export default api;
