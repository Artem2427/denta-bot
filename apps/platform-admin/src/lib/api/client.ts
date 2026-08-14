import createClient from 'openapi-fetch';

import { getAccessToken, refreshAccessToken } from '../auth/auth-store';
import type { paths } from './schema';

const NO_REFRESH_RETRY_PATHS = ['/auth/login', '/auth/refresh'];

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  credentials: 'include',
});

api.use({
  onRequest({ request }) {
    const token = getAccessToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
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

    const retryRequest = request.clone();
    retryRequest.headers.set('Authorization', `Bearer ${newToken}`);
    return fetch(retryRequest);
  },
});
