import { useAssetStats } from '../hooks/useAssets';

// Icon set (inline SVGs, stroke-based to match the rest of the UI).
const icons = {
  total: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  available: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  allocated: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z',
  maintenance:
    'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085',
};

// Card definitions. `value` is resolved from the fetched stats payload.
const CARDS = [
  {
    key: 'total',
    title: 'Total Assets',
    icon: icons.total,
    accent: 'text-brand-600 bg-brand-50',
    get: (s) => s.total,
  },
  {
    key: 'available',
    title: 'Available',
    icon: icons.available,
    accent: 'text-emerald-600 bg-emerald-50',
    get: (s) => s.byStatus?.Available ?? 0,
  },
  {
    key: 'allocated',
    title: 'Allocated',
    icon: icons.allocated,
    accent: 'text-blue-600 bg-blue-50',
    get: (s) => s.byStatus?.Allocated ?? 0,
  },
  {
    key: 'maintenance',
    title: 'Under Maintenance',
    icon: icons.maintenance,
    accent: 'text-amber-600 bg-amber-50',
    get: (s) => s.byStatus?.['Under Maintenance'] ?? 0,
  },
];

function StatCard({ title, icon, accent, value }) {
  return (
    <div className="card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardhover">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

/**
 * Asset Statistics: four responsive KPI cards driven by live backend counts.
 * Reusable and self-contained — it fetches its own data.
 * Responsive: 1 col (mobile) → 2 col (tablet) → 4 col (desktop).
 */
export default function AssetStats() {
  const { data, isLoading, isError } = useAssetStats();

  const grid = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4';

  if (isLoading) {
    return (
      <div className={grid}>
        {CARDS.map((c) => (
          <SkeletonCard key={c.key} />
        ))}
      </div>
    );
  }

  // On error, fall back to zeros so the section still renders cleanly.
  const stats = isError || !data ? { total: 0, byStatus: {} } : data;

  return (
    <div className={grid}>
      {CARDS.map((c) => (
        <StatCard key={c.key} title={c.title} icon={c.icon} accent={c.accent} value={c.get(stats)} />
      ))}
    </div>
  );
}
