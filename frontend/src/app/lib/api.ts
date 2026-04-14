const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not configured');
}

export function apiUrl(path: string) {
  return new URL(path, API_BASE_URL).toString();
}