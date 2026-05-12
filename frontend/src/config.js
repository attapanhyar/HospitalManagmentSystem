export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://hospital-erp-api.onrender.com' : 'http://localhost:8000');
