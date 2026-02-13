const envBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const BACKEND_URL = envBackendUrl && envBackendUrl.trim().length > 0
  ? envBackendUrl
  : "http://localhost:3000";
