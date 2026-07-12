import { STATUS_STYLES } from '../constants/assetOptions';

/** Small pill showing an asset's status with status-specific colors. */
export default function StatusBadge({ status }) {
  const styles = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {status}
    </span>
  );
}
