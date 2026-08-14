import { useQuery } from '@tanstack/react-query';

import { api } from '../../lib/api/client';
import type { components } from '../../lib/api/schema';

export type Lead = components['schemas']['LeadResponseDto'];
export type LeadStatus = Lead['status'];
export type LeadSource = Lead['source'];

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
