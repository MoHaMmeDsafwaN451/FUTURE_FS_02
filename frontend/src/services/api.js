const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export async function api(path, { token, ...options } = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.message || 'The request failed.'); error.status = response.status; throw error; }
  return data;
}
