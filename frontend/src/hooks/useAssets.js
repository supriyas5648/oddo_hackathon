import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchAssets,
  fetchAssetStats,
  fetchAsset,
  fetchAssetLifecycle,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../api/assets';
import { fetchCategories, fetchDepartments } from '../api/lookups';

const assetKeys = {
  all: ['assets'],
  list: (filters) => ['assets', 'list', filters],
  detail: (id) => ['assets', 'detail', id],
  stats: ['assets', 'stats'],
  lifecycle: (id) => ['assets', 'lifecycle', id],
};

/** Lifecycle timeline (created / allocated / returned) for an asset. */
export function useAssetLifecycle(id) {
  return useQuery({
    queryKey: assetKeys.lifecycle(id),
    queryFn: () => fetchAssetLifecycle(id),
    enabled: Boolean(id),
  });
}

/** Live status counts for the dashboard stat cards. */
export function useAssetStats() {
  return useQuery({
    queryKey: assetKeys.stats,
    queryFn: fetchAssetStats,
  });
}

/** Paginated, filtered list. Keeps previous page visible while refetching. */
export function useAssets(filters) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: () => fetchAssets(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAsset(id) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => fetchAsset(id),
    enabled: Boolean(id),
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAsset,
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: assetKeys.all });
      toast.success(`Asset ${asset.assetTag} created`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateAsset(id, payload),
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: assetKeys.all });
      toast.success(`Asset ${asset.assetTag} updated`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assetKeys.all });
      toast.success('Asset disposed');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 5 * 60_000 });
}

export function useDepartments() {
  return useQuery({ queryKey: ['departments'], queryFn: fetchDepartments, staleTime: 5 * 60_000 });
}
