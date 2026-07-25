import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/email/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verify: () => api.get('/auth/verify'),
};

export const appsAPI = {
  list: () => api.get('/apps'),
  get: (id) => api.get(`/apps/${id}`),
  create: (data) => api.post('/apps', data),
  update: (id, data) => api.patch(`/apps/${id}`, data),
  delete: (id) => api.delete(`/apps/${id}`),
};

export const smtpAPI = {
  list: () => api.get('/smtp'),
  get: (id) => api.get(`/smtp/${id}`),
  create: (data) => api.post('/smtp', data),
  update: (id, data) => api.put(`/smtp/${id}`, data),
  delete: (id) => api.delete(`/smtp/${id}`),
  test: (id, recipientEmail) => api.post(`/smtp/${id}/test${recipientEmail ? `?recipient_email=${recipientEmail}` : ''}`),
  setDefault: (id) => api.post(`/smtp/${id}/set-default`),
};

export const templatesAPI = {
  list: (category, search) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return api.get(`/templates?${params.toString()}`);
  },
  get: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  preview: (id, variables) => api.post(`/templates/${id}/preview`, { variables }),
  duplicate: (id) => api.post(`/templates/${id}/duplicate`),
};

export const sendAPI = {
  sendTemplated: (data) => api.post('/send', data),
  sendRaw: (data) => api.post('/send/raw', data),
  sendBulk: (data) => api.post('/send/bulk', data),
};

export const otpAPI = {
  generate: (data) => api.post('/otp/generate', data),
  verify: (data) => api.post('/otp/verify', data),
};

export const logsAPI = {
  list: (params) => api.get('/logs', { params }),
  stats: () => api.get('/logs/stats'),
};

export default api;
