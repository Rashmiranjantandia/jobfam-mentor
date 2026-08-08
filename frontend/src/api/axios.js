import axios from 'axios';

// Base URL comes from Vite's env — set VITE_API_URL in frontend/.env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor — attaches the JWT from localStorage to every request.
// This runs before each call so it always picks up the latest token even
// if the user just logged in without a page refresh.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
