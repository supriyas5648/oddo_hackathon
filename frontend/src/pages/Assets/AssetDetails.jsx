import { useAsset } from '../../hooks/useAssets';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import { CONDITION_STYLES } from '../../constants/assetOptions';
import { formatCurrency, formatDate } from '../../utils/format';

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{children ?? '—'}</dd>
    </div>
  );
}

export default function AssetDetails({ assetId, onEdit }) {
  // Fetch fresh detail so the modal always reflects the latest data.
  const { data: asset, isLoading, isError, error } = useAsset(assetId);

  if (isLoading) return <Spinner label="Loading asset…" />;
  if (isError) return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  if (!asset) return null;

  const warranty = asset.warrantyExpiry
    ? `${formatDate(asset.warrantyExpiry)} ${asset.warrantyActive === false ? '(expired)' : ''}`
    : '—';

  return (
    <div className="space-y-6">
      {/* Header: image + identity */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {asset.image ? (
            <img
              src={asset.image}
              alt={asset.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l4-4 4 4 4-5 6 6" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-brand-700">{asset.assetTag}</span>
            <StatusBadge status={asset.status} />
          </div>
          <h3 className="mt-1 text-xl font-semibold text-slate-800">{asset.name}</h3>
          <p className="text-sm text-slate-400">Serial: {asset.serialNumber}</p>
          <button className="btn-secondary mt-3 py-1.5" onClick={() => onEdit?.(asset)}>
            Edit asset
          </button>
        </div>
      </div>

      {/* Detail grid */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-3">
        <Field label="Department">{asset.department?.name}</Field>
        <Field label="Category">{asset.category?.name}</Field>
        <Field label="Location">{asset.location || '—'}</Field>
        <Field label="Purchase Date">{formatDate(asset.purchaseDate)}</Field>
        <Field label="Purchase Cost">{formatCurrency(asset.purchaseCost)}</Field>
        <Field label="Warranty">{warranty}</Field>
        <Field label="Condition">
          <span className={CONDITION_STYLES[asset.condition] || ''}>{asset.condition}</span>
        </Field>
        <Field label="Bookable">{asset.isBookable ? 'Yes' : 'No'}</Field>
        <Field label="Created By">{asset.createdBy?.name || '—'}</Field>
      </dl>

      {/* Documents */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">Documents</h4>
        {asset.documents?.length ? (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {asset.documents.map((doc, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-700">{doc.name}</span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand-600 hover:underline"
                >
                  Open ↗
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No documents attached.</p>
        )}
      </div>

      {/* Activity Timeline — placeholder, to be populated by a future module */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-700">Activity Timeline</h4>
        <ol className="relative border-l border-slate-200 pl-5">
          <li className="mb-1">
            <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white" />
            <p className="text-sm font-medium text-slate-800">Asset Created</p>
            <p className="text-xs text-slate-400">{formatDate(asset.createdAt)}</p>
          </li>
        </ol>
        <p className="mt-3 text-xs italic text-slate-400">
          Allocation, maintenance, and booking events will appear here.
        </p>
      </div>
    </div>
  );
}
