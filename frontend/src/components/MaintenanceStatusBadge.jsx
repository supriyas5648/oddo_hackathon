import { MAINTENANCE_STATUS_STYLES } from '../constants/maintenanceOptions';

/** Colored pill for a maintenance status (Pending/In Progress/Completed). */
export default function MaintenanceStatusBadge({ status }) {
  const styles =
    MAINTENANCE_STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {status}
    </span>
  );
}
