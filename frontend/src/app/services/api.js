import axios from "axios";

const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: DEFAULT_BASE,
  timeout: 15000,
});

// Attach auth token from localStorage if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        if (token.startsWith("Bearer ") || token.startsWith("Token ")) {
          config.headers.Authorization = token;
        }
        else {
          config.headers.Authorization = `Token ${token}`;
        }
      }
    }
  }
  catch (err) {
    // ignore
  }
  return config;
}, (error) => Promise.reject(error));

// Simple response handler: unwrap data or throw
api.interceptors.response.use((response) => response, (error) => {
  // Propagate a clear error message
  if (error.response) {
    const err = new Error(error.response.data?.detail || error.response.statusText || 'API error');
    err.status = error.response.status;
    err.payload = error.response.data;
    return Promise.reject(err);
  }
  return Promise.reject(new Error(error.message || 'Network error'));
});

// Small helper to retry GETs a configurable number of times (simple backoff)
async function retryableGet(url, opts = {}, attempts = 2) {
  let lastError;
  for (let i = 0; i <= attempts; i++) {
    try {
      const res = await api.get(url, opts);
      return res.data;
    }
    catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
  }
  throw lastError;
}

export { api, retryableGet };
