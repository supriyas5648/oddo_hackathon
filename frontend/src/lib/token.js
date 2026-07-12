// Small helper around the persisted auth token. Kept in one place so both the
// Axios interceptor and the AuthContext read/write the same key.
//
// Note: localStorage is used for simplicity. It is readable by JS (XSS-exposed);
// for higher security move to an httpOnly cookie + CSRF token later.
const TOKEN_KEY = 'assetflow_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
