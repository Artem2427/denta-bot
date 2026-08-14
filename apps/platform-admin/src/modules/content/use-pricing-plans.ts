import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api/client';
import type { components } from '../../lib/api/schema';

export type PricingPlan = components['schemas']['PricingPlanResponseDto'];
export type CreatePricingPlanInput =
  components['schemas']['CreatePricingPlanDto'];
export type UpdatePricingPlanInput =
  components['schemas']['UpdatePricingPlanDto'];

// Carries the HTTP status alongside the parsed error body — mirrors
// use-blog-posts.ts's ApiError (kept as a separate class per-module,
// matching 05-05/05-06/Task 1's established pattern).
export class ApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.status = status;
  }
}

export function usePricingPlans() {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await api.GET('/pricing-plans');
      if (error) throw error;
      return data;
    },
  });
}

export function usePricingPlan(id: string) {
  return useQuery({
    queryKey: ['pricing-plans', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/pricing-plans/{id}', {
        params: { path: { id } },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreatePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreatePricingPlanInput) => {
      // Checked via response.ok (not the `error` field) — see
      // use-blog-posts.ts's identical comment for the reason.
      const { data, response } = await api.POST('/pricing-plans', { body });
      if (!response.ok) throw new ApiError(response.status);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });
}

export function useUpdatePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      body: UpdatePricingPlanInput;
    }) => {
      const { data, response } = await api.PATCH('/pricing-plans/{id}', {
        params: { path: { id: input.id } },
        body: input.body,
      });
      if (!response.ok) throw new ApiError(response.status);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      queryClient.invalidateQueries({
        queryKey: ['pricing-plans', variables.id],
      });
    },
  });
}

export function useDeletePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { response } = await api.DELETE('/pricing-plans/{id}', {
        params: { path: { id } },
      });
      if (!response.ok) throw new ApiError(response.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });
}
