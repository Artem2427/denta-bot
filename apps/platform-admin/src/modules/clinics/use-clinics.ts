import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api/client';
import type { components } from '../../lib/api/schema';

export type Clinic = components['schemas']['ClinicResponseDto'];
export type ClinicStatus = Clinic['status'];
export type CreateClinicInput = components['schemas']['CreateClinicDto'];
export type UpdateClinicInput = components['schemas']['UpdateClinicDto'];

export function useClinics(status?: ClinicStatus) {
  return useQuery({
    queryKey: ['clinics', { status }],
    queryFn: async () => {
      const { data, error } = await api.GET('/clinics', {
        params: { query: { status } },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: ['clinics', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/clinics/{id}', {
        params: { path: { id } },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateClinicInput) => {
      const { data, error } = await api.POST('/clinics', { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; body: UpdateClinicInput }) => {
      const { data, error } = await api.PATCH('/clinics/{id}', {
        params: { path: { id: input.id } },
        body: input.body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', variables.id] });
    },
  });
}
