import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For HttpOnly cookies (JWT)
});

// TODO: Add request interceptor for auth tokens
// TODO: Add response interceptor for error handling
// TODO: Add refresh token logic

export default api;
