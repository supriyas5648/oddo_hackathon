// Mirrors the backend maintenance enums + badge colors.
// Pending → Orange · In Progress → Blue · Completed → Green

export const MAINTENANCE_STATUSES = ['Pending', 'In Progress', 'Completed'];

// Conditions an asset can be returned to service in (never "Damaged").
export const REPAIR_CONDITIONS = ['Excellent', 'Good', 'Fair'];

export const MAINTENANCE_STATUS_STYLES = {
  Pending: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};
