// Centralized API utility to always send Authorization header if token exists
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
  };
  return fetch(url, {
    ...options,
    headers,
  });
}
