const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://influencer-connect-ttvy.onrender.com';

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
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
};

export const apiFetch = async (path, options = {}) => {
  const headers = options.headers ? { ...options.headers } : {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body,
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch { /* ignore */ }
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
};

// Alias
export const api = apiFetch;

// Role-specific helpers
export const adminApi    = (path, options = {}) => apiFetch(`/api/admin${path}`, options);
export const influencerApi = (path, options = {}) => apiFetch(`/api/influencer${path}`, options);
export const businessApi   = (path, options = {}) => apiFetch(`/api/business${path}`, options);
