import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Build up-to-2-letter initials from a full name for the avatar.
function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

const NAV = [
  { to: '/assets', label: 'Assets', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  {
    to: '/maintenance',
    label: 'Maintenance',
    icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085',
  },
  // Departments & Categories are master data for the Asset module only — they
  // are managed via the Asset form/filters, so they have no nav entry of their
  // own. (Their backend APIs and collections remain in place.)
];

function NavItem({ item }) {
  const base =
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `${base} ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`
      }
    >
      <Icon d={item.icon} />
      {item.label}
    </NavLink>
  );
}

function Icon({ d }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/** ERP-style app shell: fixed sidebar + top bar + scrollable content. */
export default function Layout({ children }) {
  const { manager, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            AF
          </div>
          <span className="text-lg font-semibold text-slate-800">AssetFlow</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
          Enterprise Asset & Resource Management
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              AF
            </div>
            <span className="font-semibold text-slate-800">AssetFlow</span>
          </div>
          <div className="hidden text-sm text-slate-400 lg:block">Asset Management</div>
          <div className="flex items-center gap-3">
            {/* Logged-in manager */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {initials(manager?.fullName)}
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight text-slate-800">
                  {manager?.fullName || 'Manager'}
                </p>
                <p className="text-xs leading-tight text-slate-400">{manager?.role || 'Manager'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary px-3 py-1.5"
              title="Log out"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
