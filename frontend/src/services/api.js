import axios from 'axios';

// Determine backend API URL (Supports Render production & local dev environment)
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  return 'https://aicustomersupport-lpao.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
