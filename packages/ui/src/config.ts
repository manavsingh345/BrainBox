import { DEFAULT_BACKEND_URL } from "@mysecondbrain/common";

const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const BACKEND_URL = envBackendUrl && envBackendUrl.trim().length > 0
  ? envBackendUrl
  : DEFAULT_BACKEND_URL;
