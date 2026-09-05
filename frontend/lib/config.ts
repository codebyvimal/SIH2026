// Use absolute URL for server-side fetches, and relative (proxied) URL for client-side fetches
const IS_SERVER = typeof window === 'undefined';
export const API_BASE = IS_SERVER 
  ? (process.env.INTERNAL_API_BASE ?? 'http://127.0.0.1:8000/api/v1')
  : (process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1');
