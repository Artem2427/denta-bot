import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api/client';
import type { components } from '../../lib/api/schema';

export type Lead = components['schemas']['LeadResponseDto'];
export type LeadStatus = Lead['status'];
export type LeadSource = Lead['source'];

// Carries the HTTP status alongside the parsed error body so callers can
// distinguish e.g. a 409 duplicate-email conflict from other failures
// without re-parsing the raw Response themselves — mirrors use-clinics.ts's
// ApiError (kept as a separate class per-module, not shared, since the two
// modules aren't wired together beyond this plan's own scope).
export class ApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.status = status;
  }
}

export function useLeads(status?: LeadStatus, from?: string, to?: string) {
  return useQuery({
    queryKey: ['leads', { status, from, to }],
    queryFn: async () => {
      const { data, error } = await api.GET('/leads', {
        params: { query: { status, from, to } },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/leads/{id}', {
        params: { path: { id } },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: LeadStatus }) => {
      // Checked via response.ok (not the `error` field) — LeadsController
      // doesn't declare an explicit error response schema, so the generated
      // `error` type resolves to `never` and narrowing on it collapses the
      // whole branch (including `response`) to `never` too (05-05 pitfall).
      const { data, response } = await api.PATCH('/leads/{id}/status', {
        params: { path: { id: input.id } },
        body: { status: input.status },
      });
      if (!response.ok) throw new ApiError(response.status);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, response } = await api.POST('/leads/{id}/convert', {
        params: { path: { id } },
      });
      if (!response.ok) throw new ApiError(response.status);
      return data;
    },
    onSuccess: (_data, id) => {
      // A successful conversion creates a new Clinic — invalidate ['clinics']
      // alongside ['leads']/['leads', id] so the Clinics list reflects it
      // without a manual page refresh.
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', id] });
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
}
