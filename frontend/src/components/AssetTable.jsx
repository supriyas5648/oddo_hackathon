import StatusBadge from './StatusBadge';
import AllocateButton from './AllocateButton';

/**
 * Desktop table of assets. Presentational only — all actions bubble up
 * through the on* callbacks so the parent owns state and data-fetching.
 */
export default function AssetTable({ assets, onView, onEdit, onDelete, onAllocate, deletingId }) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {['Asset Tag', 'Name', 'Department', 'Category', 'Status', 'Actions'].map((h) => (
              <th
                key={h}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  h === 'Actions' ? 'text-right' : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {assets.map((asset) => (
            <tr key={asset._id} className="hover:bg-slate-50/70">
              <td className="whitespace-nowrap px-4 py-3">
                <span className="font-mono text-sm font-medium text-brand-700">{asset.assetTag}</span>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{asset.name}</div>
                <div className="text-xs text-slate-400">SN: {asset.serialNumber}</div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {asset.department?.name || '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {asset.category?.name || '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={asset.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <div className="inline-flex items-center gap-1">
                  <AllocateButton asset={asset} onAllocate={onAllocate} />
                  <button className="btn-ghost px-2 py-1" onClick={() => onView(asset)} title="View">
                    View
                  </button>
                  <button className="btn-ghost px-2 py-1" onClick={() => onEdit(asset)} title="Edit">
                    Edit
                  </button>
                  <button
                    className="btn-ghost px-2 py-1 text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(asset)}
                    disabled={deletingId === asset._id}
                    title="Dispose asset"
                  >
                    {deletingId === asset._id ? '…' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
