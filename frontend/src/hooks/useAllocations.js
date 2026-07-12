import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createAllocation,
  returnAllocation,
  fetchAssetAllocations,
  fetchEmployeeAllocations,
} from '../api/allocations';
import { fetchEmployees } from '../api/lookups';

const allocationKeys = {
  all: ['allocations'],
  byAsset: (assetId) => ['allocations', 'asset', assetId],
  byEmployee: (employeeId) => ['allocations', 'employee', employeeId],
};

/** Active users available for allocation (dropdown source). */
export function useEmployees() {
  return useQuery({ queryKey: ['employees'], queryFn: fetchEmployees, staleTime: 5 * 60_000 });
}

/** The single active allocation for an asset (or null). Used on Asset Details. */
export function useActiveAllocation(assetId) {
  return useQuery({
    queryKey: [...allocationKeys.byAsset(assetId), 'active'],
    queryFn: () => fetchAssetAllocations(assetId, { status: 'Active', limit: 1 }),
    enabled: Boolean(assetId),
    select: (res) => res.items[0] || null,
  });
}

/** Full allocation history for an asset. */
export function useAssetAllocations(assetId) {
  return useQuery({
    queryKey: allocationKeys.byAsset(assetId),
    queryFn: () => fetchAssetAllocations(assetId),
    enabled: Boolean(assetId),
  });
}

/** Full allocation history for an employee. */
export function useEmployeeAllocations(employeeId) {
  return useQuery({
    queryKey: allocationKeys.byEmployee(employeeId),
    queryFn: () => fetchEmployeeAllocations(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useCreateAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAllocation,
    onSuccess: (allocation) => {
      // Refresh allocations AND assets (status + stats cards) since allocating
      // flips the asset to Allocated.
      qc.invalidateQueries({ queryKey: allocationKeys.all });
      qc.invalidateQueries({ queryKey: ['assets'] });
      const name = allocation?.employee?.name || 'employee';
      const tag = allocation?.asset?.assetTag || 'asset';
      toast.success(`${tag} allocated to ${name}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useReturnAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => returnAllocation(id, payload),
    onSuccess: (allocation) => {
      // Returning frees the asset -> refresh allocations, asset details,
      // stats cards, and the lifecycle timeline.
      qc.invalidateQueries({ queryKey: allocationKeys.all });
      qc.invalidateQueries({ queryKey: ['assets'] });
      const name = allocation?.employee?.name || 'employee';
      toast.success(`Asset returned by ${name}`);
    },
    onError: (err) => toast.error(err.message),
  });
}
