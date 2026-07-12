import { formatDate } from '../utils/format';

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">{children ?? '—'}</dd>
    </div>
  );
}

/**
 * "Current Allocation" card. Renders the active allocation for an asset in a
 * clean ERP style. Presentational — pass a populated allocation document.
 */
export default function AllocationCard({ allocation }) {
  if (!allocation) return null;

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Current Allocation</h4>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {allocation.status}
        </span>
      </div>
      <dl className="divide-y divide-brand-100/70">
        <Row label="Employee">{allocation.employee?.name}</Row>
        <Row label="Allocated By">{allocation.allocatedBy?.name || '—'}</Row>
        <Row label="Allocation Date">{formatDate(allocation.allocationDate)}</Row>
        <Row label="Expected Return">{formatDate(allocation.expectedReturnDate)}</Row>
        <Row label="Purpose">{allocation.purpose || '—'}</Row>
        <Row label="Remarks">{allocation.remarks || '—'}</Row>
      </dl>
    </div>
  );
}
