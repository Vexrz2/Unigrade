import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://unigrade-backend.vercel.app/api/';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      // ensure Authorization is set on every request
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
