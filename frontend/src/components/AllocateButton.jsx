/**
 * Contextual allocation control for an asset row/card.
 * - Available  -> enabled "Allocate" button
 * - Allocated  -> disabled "Allocated" label
 * - other      -> nothing (can't be allocated in its current state)
 */
export default function AllocateButton({ asset, onAllocate, className = '' }) {
  if (asset.status === 'Available') {
    return (
      <button
        type="button"
        className={`btn-ghost px-2 py-1 font-medium text-brand-600 hover:bg-brand-50 ${className}`}
        onClick={() => onAllocate(asset)}
        title="Allocate this asset"
      >
        Allocate
      </button>
    );
  }

  if (asset.status === 'Allocated') {
    return (
      <button
        type="button"
        disabled
        className={`btn-ghost cursor-not-allowed px-2 py-1 font-medium text-slate-400 ${className}`}
        title="Asset is already allocated"
      >
        Allocated
      </button>
    );
  }

  return null;
}
