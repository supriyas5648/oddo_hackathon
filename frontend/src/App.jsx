import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Assets from './pages/Assets/Assets';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected app (RequireAuth renders the Layout shell) */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/assets" replace />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="*" element={<Navigate to="/assets" replace />} />
      </Route>
    </Routes>
  );
}
