import createClient from 'openapi-fetch';

import { getAccessToken, refreshAccessToken } from '../auth/auth-store';
import type { paths } from './schema';

const NO_REFRESH_RETRY_PATHS = ['/auth/login', '/auth/refresh'];

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  credentials: 'include',
});

// Request.clone() is only valid before the body has been read — by the time
// onResponse runs, openapi-fetch has already dispatched `request` through
// fetch(), so its body (for every POST/PATCH) is already consumed and
// clone() throws. Stash an unconsumed clone in onRequest, before dispatch,
// keyed by the same Request instance (openapi-fetch mutates and returns the
// same object between onRequest and onResponse, so the reference is stable).
const unconsumedClones = new WeakMap<Request, Request>();

api.use({
  onRequest({ request }) {
    const token = getAccessToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    if (request.body) {
      unconsumedClones.set(request, request.clone());
    }
    return request;
  },
  async onResponse({ request, response }) {
    if (response.status !== 401) {
      return response;
    }

    const url = new URL(request.url);
    if (NO_REFRESH_RETRY_PATHS.some((path) => url.pathname.endsWith(path))) {
      return response;
    }

    const newToken = await refreshAccessToken();
    if (!newToken) {
      return response;
    }

    const retryRequest = unconsumedClones.get(request) ?? request.clone();
    unconsumedClones.delete(request);
    retryRequest.headers.set('Authorization', `Bearer ${newToken}`);
    return fetch(retryRequest);
  },
});
