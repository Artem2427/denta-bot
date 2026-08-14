// In-memory-only access token holder. NEVER persisted to localStorage/
// sessionStorage — lost on reload by design, recovered via a silent
// POST /auth/refresh against the httpOnly refresh cookie (see refreshAccessToken
// below and router.tsx's authLoader).
//
// login/logout below go through the typed `api` client from ../api/client —
// refreshAccessToken deliberately does NOT (it uses raw fetch instead), to
// avoid recursing back into client.ts's own 401 -> refreshAccessToken()
// interceptor. Importing `api` here creates a circular import with
// client.ts (which imports getAccessToken/refreshAccessToken from this
// file); safe under ESM live bindings since neither side is read until
// login()/logout() actually run, well after both modules finish evaluating.
import { api } from '../api/client';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// Single shared in-flight promise: every concurrent 401 handler awaits THIS
// SAME promise instead of independently calling /auth/refresh. A naive
// per-request refresh call would be treated as refresh-token reuse by the
// backend's rotation logic (RESEARCH.md Pitfall 2) and force-logout the admin.
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        setAccessToken(null);
        return null;
      }

      const body: { accessToken?: string } = await response.json();
      const token = body.accessToken ?? null;
      setAccessToken(token);
      return token;
    } catch {
      setAccessToken(null);
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function login(email: string, password: string): Promise<void> {
  const { data, error } = await api.POST('/auth/login', {
    body: { email, password },
  });

  if (error || !data?.accessToken) {
    throw new Error('Invalid credentials.');
  }
  setAccessToken(data.accessToken);
}

export async function logout(): Promise<void> {
  try {
    await api.POST('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}
