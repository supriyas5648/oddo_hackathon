// Mirrors the backend enums. Single source of truth for the UI.

export const ASSET_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

export const ASSET_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Damaged'];

// Tailwind classes per status for the StatusBadge.
export const STATUS_STYLES = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Allocated: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Reserved: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  'Under Maintenance': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Lost: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Retired: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Disposed: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const CONDITION_STYLES = {
  Excellent: 'text-emerald-700',
  Good: 'text-blue-700',
  Fair: 'text-amber-700',
  Damaged: 'text-red-700',
};
