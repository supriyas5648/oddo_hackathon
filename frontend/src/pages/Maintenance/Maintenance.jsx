import { useMemo, useState } from 'react';
import { useMaintenance, useTechnicians } from '../../hooks/useMaintenance';
import { MAINTENANCE_STATUSES } from '../../constants/maintenanceOptions';
import { formatCurrency, formatDate } from '../../utils/format';
import SearchBar from '../../components/SearchBar';
import MaintenanceStatusBadge from '../../components/MaintenanceStatusBadge';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import StartRepairForm from './StartRepairForm';
import CompleteRepairForm from './CompleteRepairForm';

const DEFAULT_FILTERS = { search: '', status: '', technician: '', page: 1, limit: 10 };

export default function Maintenance() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [starting, setStarting] = useState(null); // record | null
  const [completing, setCompleting] = useState(null);

  const { data, isLoading, isError, error, isFetching } = useMaintenance(filters);
  const { data: technicians = [] } = useTechnicians();

  const records = data?.items || [];
  const meta = data?.meta;

  const hasActiveFilters = useMemo(
    () => Boolean(filters.search || filters.status || filters.technician),
    [filters]
  );

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Maintenance Requests</h1>
          <p className="text-sm text-slate-500">Track and resolve repairs for damaged assets.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mt-5 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SearchBar
            value={filters.search}
            onChange={(v) => setFilter('search', v)}
            placeholder="Search issue or technician…"
          />
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">All statuses</option>
            {MAINTENANCE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filters.technician}
            onChange={(e) => setFilter('technician', e.target.value)}
          >
            <option value="">All technicians</option>
            {technicians.map((t) => (
              <option key={t} value={t}>
                {t}
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
          <Spinner label="Loading maintenance requests…" />
        ) : isError ? (
          <EmptyState title="Couldn't load maintenance requests" message={error.message} />
        ) : records.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? 'No requests match your filters' : 'No maintenance requests'}
            message={
              hasActiveFilters
                ? 'Try adjusting or clearing your filters.'
                : 'Requests are created automatically when an asset is returned as Damaged.'
            }
            action={
              hasActiveFilters ? (
                <button className="btn-secondary" onClick={resetFilters}>
                  Clear filters
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Asset', 'Issue', 'Status', 'Technician', 'Started', 'Completed', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                          h === 'Actions' ? 'text-right' : ''
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-slate-800">{r.asset?.name || '—'}</div>
                      <div className="font-mono text-xs text-brand-700">{r.asset?.assetTag}</div>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <span className="line-clamp-2 text-sm text-slate-600">{r.issue || '—'}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <MaintenanceStatusBadge status={r.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {r.technicianName || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(r.maintenanceStartDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(r.maintenanceCompletedDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {r.status === 'Pending' && (
                        <button className="btn-secondary py-1.5" onClick={() => setStarting(r)}>
                          Start Repair
                        </button>
                      )}
                      {r.status === 'In Progress' && (
                        <button className="btn-primary py-1.5" onClick={() => setCompleting(r)}>
                          Complete Repair
                        </button>
                      )}
                      {r.status === 'Completed' && (
                        <span className="text-xs text-slate-400">
                          {formatCurrency(r.repairCost)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
      </div>

      {/* Start Repair modal */}
      <Modal open={Boolean(starting)} onClose={() => setStarting(null)} title="Start Repair">
        {starting && (
          <StartRepairForm
            record={starting}
            onSuccess={() => setStarting(null)}
            onCancel={() => setStarting(null)}
          />
        )}
      </Modal>

      {/* Complete Repair modal */}
      <Modal open={Boolean(completing)} onClose={() => setCompleting(null)} title="Complete Repair">
        {completing && (
          <CompleteRepairForm
            record={completing}
            onSuccess={() => setCompleting(null)}
            onCancel={() => setCompleting(null)}
          />
        )}
      </Modal>
    </div>
  );
}
