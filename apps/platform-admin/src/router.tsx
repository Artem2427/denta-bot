import { createBrowserRouter, redirect } from 'react-router';

import { getAccessToken, refreshAccessToken } from './lib/auth/auth-store';
import { LoginPage } from './modules/auth/login-page';
import { ClinicDetailPage } from './modules/clinics/clinic-detail-page';
import { ClinicsListPage } from './modules/clinics/clinics-list-page';
import { BlogPostFormPage } from './modules/content/blog-post-form-page';
import { BlogPostsPage } from './modules/content/blog-posts-page';
import { PricingPlansPage } from './modules/content/pricing-plans-page';
import { LeadDetailPage } from './modules/leads/lead-detail-page';
import { LeadsInboxPage } from './modules/leads/leads-inbox-page';
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
      { path: 'clinics/:id', Component: ClinicDetailPage },
      { path: 'leads', Component: LeadsInboxPage },
      { path: 'leads/:id', Component: LeadDetailPage },
      { path: 'content/blog', Component: BlogPostsPage },
      { path: 'content/blog/new', Component: BlogPostFormPage },
      { path: 'content/blog/:id/edit', Component: BlogPostFormPage },
      { path: 'content/pricing', Component: PricingPlansPage },
    ],
  },
]);
