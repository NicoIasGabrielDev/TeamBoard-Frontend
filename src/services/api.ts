import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "https://teamboard-backend-1.onrender.com",
});

export default api;