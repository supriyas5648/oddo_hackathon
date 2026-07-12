# AssetFlow — Frontend

React + Vite dashboard for the AssetFlow Asset Management module.

## Stack

- **React 18 + Vite** — SPA + fast dev server
- **React Router** — routing (`/assets`)
- **@tanstack/react-query** — server-state, caching, mutations (no Redux)
- **Axios** — HTTP client with a response interceptor that unwraps the API envelope
- **react-hot-toast** — toast notifications
- **Tailwind CSS** — styling (no Bootstrap)

## Structure

```
frontend/src/
├── main.jsx                 # QueryClient + Router + Toaster providers
├── App.jsx                  # Routes
├── lib/axios.js             # Axios instance + error normalization
├── api/                     # Endpoint functions (assets, lookups)
├── hooks/useAssets.js       # React Query hooks (queries + mutations)
├── constants/               # Status/condition enums + badge styles
├── utils/format.js          # Currency/date formatting
├── components/
│   ├── Layout.jsx           # ERP shell: sidebar + topbar
│   ├── StatusBadge.jsx      # Colored status pill
│   ├── SearchBar.jsx        # Debounced search input
│   ├── AssetTable.jsx       # Desktop table
│   ├── AssetCard.jsx        # Mobile card
│   ├── Modal.jsx            # Accessible modal
│   ├── ConfirmDialog.jsx    # Destructive-action confirm
│   ├── Spinner.jsx / EmptyState.jsx
└── pages/Assets/
    ├── Assets.jsx           # List page: filters, table, pagination, modals
    ├── AssetForm.jsx        # Create/Edit form (client validation)
    └── AssetDetails.jsx     # Detail view + Activity Timeline
```

## Getting Started

```bash
cd frontend
cp .env.example .env      # defaults are fine for local dev
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server **proxies `/api` → `http://localhost:5000`** (see
`vite.config.js`), so start the backend first (`cd ../backend && npm run dev`).
No CORS configuration needed in dev. To point at a different backend, set
`VITE_API_PROXY` (dev proxy) or `VITE_API_URL` (absolute API base) in `.env`.

## Features

- **List** with server-side search + status/department/category filters (combined), pagination, loading & empty states.
- **Add / Edit** via modal with inline validation mirroring the backend rules; server-side field errors (e.g. duplicate serial) surface inline.
- **View** modal shows image, full details, documents, and an Activity Timeline seeded with "Asset Created" (ready to extend).
- **Delete** is a **soft delete** (asset → Disposed) with a confirmation dialog.
- Toasts on every create/update/delete.
- Responsive: table on desktop, cards on mobile.

> React Query invalidates the `['assets']` cache after each mutation, so lists
> and details stay in sync automatically without manual refetching.
