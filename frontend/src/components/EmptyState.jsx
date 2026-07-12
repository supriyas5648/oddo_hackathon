/** Friendly empty/no-results placeholder with an optional action. */
export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 00-2-2h-5l-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2h6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 15v6m3-3h-6" />
        </svg>
      </div>
      <div>
        <p className="font-medium text-slate-700">{title}</p>
        {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
      </div>
      {action}
    </div>
  );
}
