import { formatDate } from '../utils/format';

// Per-event-type visual config: colored circular marker + matching icon.
// Full class strings are kept literal so Tailwind's scanner includes them.
// 🟢 created · 🔵 allocated · 🟠 returned · 🔴 maintenance · 🟣 transferred
const EVENT_STYLES = {
  created: {
    marker: 'bg-emerald-100 text-emerald-600', // green
    icon: 'M12 4v16m8-8H4', // plus
  },
  allocated: {
    marker: 'bg-blue-100 text-blue-600', // blue
    icon: 'M17 8l4 4m0 0l-4 4m4-4H3', // arrow-right / handed out
  },
  returned: {
    marker: 'bg-orange-100 text-orange-600', // orange
    icon: 'M7 16l-4-4m0 0l4-4m-4 4h18', // arrow-left / checked in
  },
  maintenance_started: {
    marker: 'bg-red-100 text-red-600', // red
    icon: 'M11.5 6.5a4 4 0 01-5.5 5.3L3 15l6 6 3.2-3a4 4 0 015.3-5.5l-3.5-3.5 2-2-2-2-2 2-3.2-3.5z', // wrench
  },
  maintenance_completed: {
    marker: 'bg-emerald-100 text-emerald-600', // green — back in service
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // check-circle
  },
  transferred: {
    marker: 'bg-purple-100 text-purple-600', // purple (future-ready)
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4', // swap / transfer
  },
};

function EventIcon({ type }) {
  const style = EVENT_STYLES[type] || EVENT_STYLES.created;
  return (
    <span
      className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white ${style.marker}`}
    >
      <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={style.icon} />
      </svg>
    </span>
  );
}

/**
 * Vertical lifecycle timeline. Expects events already sorted newest-first
 * (the backend returns them that way). Presentational and reusable.
 */
export default function LifecycleTimeline({ events = [] }) {
  if (!events.length) {
    return <p className="text-sm text-slate-400">No lifecycle events yet.</p>;
  }

  return (
    <ol className="relative">
      {/* Continuous vertical line behind the markers */}
      <span className="absolute left-4 top-4 bottom-4 w-px bg-slate-200" aria-hidden="true" />

      {events.map((event, i) => (
        <li
          key={`${event.type}-${event.allocationId || event.maintenanceId || 'created'}-${i}`}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          <EventIcon type={event.type} />
          <div className="pt-1">
            <p className="text-sm font-bold text-slate-800">{event.title}</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
              <span>{formatDate(event.date)}</span>
              {event.type === 'returned' && event.condition && (
                <span className="rounded-full bg-orange-50 px-2 py-0.5 font-medium text-orange-600">
                  {event.condition}
                </span>
              )}
              {event.type === 'maintenance_started' && event.technician && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600">
                  {event.technician}
                </span>
              )}
              {event.type === 'maintenance_completed' && event.condition && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                  {event.condition}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
