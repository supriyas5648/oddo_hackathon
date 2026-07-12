import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchMaintenance,
  fetchTechnicians,
  startRepair,
  completeRepair,
} from '../api/maintenance';

const keys = {
  all: ['maintenance'],
  list: (filters) => ['maintenance', 'list', filters],
  technicians: ['maintenance', 'technicians'],
};

export function useMaintenance(filters) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => fetchMaintenance(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTechnicians() {
  return useQuery({ queryKey: keys.technicians, queryFn: fetchTechnicians, staleTime: 60_000 });
}

export function useStartRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => startRepair(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success('Repair started');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useCompleteRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => completeRepair(id, payload),
    onSuccess: () => {
      // Completing a repair frees the asset -> refresh maintenance AND assets
      // (status + stats + lifecycle).
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Repair completed — asset returned to service');
    },
    onError: (err) => toast.error(err.message),
  });
}
