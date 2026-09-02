import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token or demo impersonation header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resolvai_token');
  const demoUserId = localStorage.getItem('resolvai_demo_user_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (demoUserId) {
    config.headers['x-demo-user-id'] = demoUserId;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
