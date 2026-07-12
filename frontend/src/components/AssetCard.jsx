import StatusBadge from './StatusBadge';

/**
 * Mobile-friendly card representation of an asset. Used on small screens
 * where the table would overflow.
 */
export default function AssetCard({ asset, onView, onEdit, onDelete, deletingId }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-xs font-medium text-brand-700">{asset.assetTag}</span>
          <h3 className="truncate font-semibold text-slate-800">{asset.name}</h3>
          <p className="text-xs text-slate-400">SN: {asset.serialNumber}</p>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-slate-400">Department</dt>
          <dd className="text-slate-700">{asset.department?.name || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Category</dt>
          <dd className="text-slate-700">{asset.category?.name || '—'}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <button className="btn-secondary flex-1 py-1.5" onClick={() => onView(asset)}>
          View
        </button>
        <button className="btn-secondary flex-1 py-1.5" onClick={() => onEdit(asset)}>
          Edit
        </button>
        <button
          className="btn-danger flex-1 py-1.5"
          onClick={() => onDelete(asset)}
          disabled={deletingId === asset._id}
        >
          {deletingId === asset._id ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
