// Backend is careerkalam360-backend on Render — same service the main site talks
// to, same CORS allowlist (this app is served from the same origin as the main
// site, careerkalam360.com, just a different path, so no new CORS entry is
// needed on the backend).
export const API_BASE = 'https://careerkalam360-backend.onrender.com';

// Must match PRICE_PAISE in the backend's routes/streamCompass.js exactly (that's
// what actually gets charged; this is display-only).
export const DISPLAY_PRICE = '₹299';

class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // No/invalid JSON body — fine for 204s.
  }

  if (!res.ok) {
    const message = body?.error?.message || 'Something went wrong. Please try again.';
    throw new ApiError(message, { status: res.status, code: body?.error?.code });
  }

  return body;
}

export const api = {
  prefill: (email, phone) => {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (phone) params.set('phone', phone);
    return request(`/api/stream-compass/prefill?${params.toString()}`);
  },
  start: (details) => request('/api/stream-compass/start', { method: 'POST', body: JSON.stringify(details) }),
  getAssessment: (id) => request(`/api/stream-compass/assessment/${id}`),
  createOrder: (id) => request(`/api/stream-compass/assessment/${id}/payment/order`, { method: 'POST' }),
  verifyPayment: (id, payload) =>
    request(`/api/stream-compass/assessment/${id}/payment/verify`, { method: 'POST', body: JSON.stringify(payload) }),
  getQuestions: (id) => request(`/api/stream-compass/assessment/${id}/questions`),
  getResponses: (id) => request(`/api/stream-compass/assessment/${id}/responses`),
  saveResponse: (id, questionId, optionId) =>
    request(`/api/stream-compass/assessment/${id}/responses/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify({ optionId })
    }),
  submit: (id) => request(`/api/stream-compass/assessment/${id}/submit`, { method: 'POST' }),
  getResults: (id) => request(`/api/stream-compass/assessment/${id}/results`),
  adminLogin: (email, password) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(async (res) => {
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new ApiError(body?.error?.message || 'Login failed.', { status: res.status });
      return body;
    }),
  adminMe: () => fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' }),
  adminListPaid: () =>
    fetch(`${API_BASE}/api/admin/stream-compass/payments`, { credentials: 'include' }).then(async (res) => {
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new ApiError(body?.error?.message || 'Could not load the list.', { status: res.status });
      return body;
    })
};

export { ApiError };
