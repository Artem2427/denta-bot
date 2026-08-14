import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api/client';
import type { components } from '../../lib/api/schema';

export type BlogPost = components['schemas']['BlogPostResponseDto'];
export type CreateBlogPostInput = components['schemas']['CreateBlogPostDto'];
export type UpdateBlogPostInput = components['schemas']['UpdateBlogPostDto'];

// Carries the HTTP status alongside the parsed error body so callers can
// distinguish e.g. a 409 duplicate-slug conflict from other failures
// without re-parsing the raw Response themselves — mirrors use-clinics.ts's
// ApiError (kept as a separate class per-module, matching 05-05/05-06's
// established pattern rather than sharing across modules).
export class ApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.status = status;
  }
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await api.GET('/blog-posts');
      if (error) throw error;
      return data;
    },
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: ['blog-posts', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/blog-posts/{id}', {
        params: { path: { id } },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateBlogPostInput) => {
      // Checked via response.ok (not the `error` field) — BlogPostsController
      // doesn't declare an explicit error response schema, so the generated
      // `error` type resolves to `never` and narrowing on it collapses the
      // whole branch (including `response`) to `never` too (05-05 pitfall).
      const { data, response } = await api.POST('/blog-posts', { body });
      if (!response.ok) throw new ApiError(response.status);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; body: UpdateBlogPostInput }) => {
      const { data, response } = await api.PATCH('/blog-posts/{id}', {
        params: { path: { id: input.id } },
        body: input.body,
      });
      if (!response.ok) throw new ApiError(response.status);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts', variables.id] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { response } = await api.DELETE('/blog-posts/{id}', {
        params: { path: { id } },
      });
      if (!response.ok) throw new ApiError(response.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}
