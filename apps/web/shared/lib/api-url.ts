// Single source of truth for the backend API base URL. Server Components
// (Blog/Prices reads) use getServerApiUrl(); 'use client' components
// (Contacts/Demo lead forms) use getClientApiUrl() — same fallback
// convention as apps/platform-admin/src/lib/api/client.ts's Vite env var.
export function getServerApiUrl(): string {
  return process.env.API_URL ?? 'http://localhost:4000';
}

export function getClientApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}
