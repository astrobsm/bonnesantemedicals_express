// Centralized API utility to always send Authorization header if token exists
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
  };
  // Prepend base URL if url is relative
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  return fetch(fullUrl, {
    ...options,
    headers,
  });
}
