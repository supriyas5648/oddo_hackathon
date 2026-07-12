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
  { to: '/departments', label: 'Departments', icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1M9 13h1m4 0h1', disabled: true },
  { to: '/categories', label: 'Categories', icon: 'M4 6h16M4 12h16M4 18h16', disabled: true },
];

function NavItem({ item }) {
  const base =
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';
  if (item.disabled) {
    return (
      <span className={`${base} cursor-not-allowed text-slate-400`} title="Coming soon">
        <Icon d={item.icon} />
        {item.label}
      </span>
    );
  }
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
