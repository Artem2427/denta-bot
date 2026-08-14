import { createBrowserRouter, redirect } from 'react-router';

import { getAccessToken, refreshAccessToken } from './lib/auth/auth-store';
import { LoginPage } from './modules/auth/login-page';
import { ClinicsListPage } from './modules/clinics/clinics-list-page';
import { AppShell } from './shared/components/app-shell';

async function authLoader() {
  if (!getAccessToken()) {
    const token = await refreshAccessToken();
    if (!token) {
      throw redirect('/login');
    }
  }
  return null;
}

export const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  {
    path: '/',
    loader: authLoader,
    Component: AppShell,
    children: [
      { index: true, loader: () => redirect('/clinics') },
      { path: 'clinics', Component: ClinicsListPage },
    ],
  },
]);
