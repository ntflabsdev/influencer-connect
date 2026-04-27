const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://influencer-connect-ttvy.onrender.com';
const ADMIN_API_BASE = `${API_BASE}/api/admin`;

export const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
export const setTokens = (accessToken, refreshToken) => {
  if (typeof window === 'undefined') return;
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};
export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const apiFetch = async (path, options = {}) => {
  const headers = options.headers ? { ...options.headers } : {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body,
    cache: 'no-store',
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch (e) {
      /* ignore */
    }
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
};

// Alias for backward compatibility
export const api = apiFetch;

// Admin API function with /api/admin prefix
export const adminApi = (path, options = {}) => apiFetch(`/api/admin${path}`, options);
