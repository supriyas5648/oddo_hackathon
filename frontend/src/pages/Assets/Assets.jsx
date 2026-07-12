import { useMemo, useState } from 'react';
import {
  useAssets,
  useDeleteAsset,
  useCategories,
  useDepartments,
} from '../../hooks/useAssets';
import { ASSET_STATUSES } from '../../constants/assetOptions';
import AssetStats from '../../components/AssetStats';
import SearchBar from '../../components/SearchBar';
import AssetTable from '../../components/AssetTable';
import AssetCard from '../../components/AssetCard';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import AssetForm from './AssetForm';
import AssetDetails from './AssetDetails';
import AllocateForm from './AllocateForm';

const DEFAULT_FILTERS = { search: '', status: '', department: '', category: '', page: 1, limit: 10 };

export default function Assets() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Modal state: which asset (if any) and which view is open.
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // asset | null (null = create)
  const [viewingId, setViewingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [allocating, setAllocating] = useState(null); // asset being allocated | null

  const { data, isLoading, isError, error, isFetching } = useAssets(filters);
  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();
  const deleteMut = useDeleteAsset();

  const assets = data?.items || [];
  const meta = data?.meta;

  const hasActiveFilters = useMemo(
    () => Boolean(filters.search || filters.status || filters.department || filters.category),
    [filters]
  );

  // Any filter change resets to page 1.
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (asset) => {
    setViewingId(null);
    setEditing(asset);
    setFormOpen(true);
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    await deleteMut.mutateAsync(toDelete._id);
    setToDelete(null);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Assets</h1>
          <p className="text-sm text-slate-500">
            Manage your organization&apos;s assets and resources.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          Add Asset
        </button>
      </div>

      {/* Asset Statistics */}
      <div className="mt-5">
        <AssetStats />
      </div>

      {/* Filters */}
      <div className="card mt-5 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-1">
            <SearchBar
              value={filters.search}
              onChange={(v) => setFilter('search', v)}
              placeholder="Search name, tag, serial…"
            />
          </div>
          <select
            className="input"
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filters.department}
            onChange={(e) => setFilter('department', e.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">All statuses</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isFetching ? 'Updating…' : `${meta?.total ?? 0} result(s)`}
            </span>
            <button className="btn-ghost px-2 py-1 text-brand-600" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-5">
        {isLoading ? (
          <Spinner label="Loading assets…" />
        ) : isError ? (
          <EmptyState
            title="Couldn't load assets"
            message={error.message}
            action={
              <button className="btn-secondary" onClick={() => setFilters((f) => ({ ...f }))}>
                Retry
              </button>
            }
          />
        ) : assets.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? 'No assets match your filters' : 'No assets yet'}
            message={
              hasActiveFilters
                ? 'Try adjusting or clearing your filters.'
                : 'Get started by adding your first asset.'
            }
            action={
              hasActiveFilters ? (
                <button className="btn-secondary" onClick={resetFilters}>
                  Clear filters
                </button>
              ) : (
                <button className="btn-primary" onClick={openCreate}>
                  Add Asset
                </button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <AssetTable
              assets={assets}
              onView={(a) => setViewingId(a._id)}
              onEdit={openEdit}
              onDelete={(a) => setToDelete(a)}
              onAllocate={(a) => setAllocating(a)}
              deletingId={deleteMut.isPending ? toDelete?._id : null}
            />
            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
              {assets.map((a) => (
                <AssetCard
                  key={a._id}
                  asset={a}
                  onView={(x) => setViewingId(x._id)}
                  onEdit={openEdit}
                  onDelete={(x) => setToDelete(x)}
                  onAllocate={(x) => setAllocating(x)}
                  deletingId={deleteMut.isPending ? toDelete?._id : null}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Page {meta.page} of {meta.totalPages} · {meta.total} total
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary py-1.5"
                    disabled={meta.page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-secondary py-1.5"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.assetTag}` : 'Add Asset'}
      >
        <AssetForm
          asset={editing}
          onSuccess={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      {/* Details modal */}
      <Modal open={Boolean(viewingId)} onClose={() => setViewingId(null)} title="Asset Details">
        {viewingId && <AssetDetails assetId={viewingId} onEdit={openEdit} />}
      </Modal>

      {/* Allocate modal */}
      <Modal open={Boolean(allocating)} onClose={() => setAllocating(null)} title="Allocate Asset">
        {allocating && (
          <AllocateForm
            asset={allocating}
            onSuccess={() => setAllocating(null)}
            onCancel={() => setAllocating(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Dispose asset?"
        message={
          toDelete
            ? `"${toDelete.name}" (${toDelete.assetTag}) will be marked as Disposed. This is a soft delete — the record is retained for audit history.`
            : ''
        }
        confirmLabel="Dispose"
        loading={deleteMut.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
