import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Assets from './pages/Assets/Assets';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/assets" replace />} />
        <Route path="/assets" element={<Assets />} />
        {/* Fallback: anything unknown -> assets */}
        <Route path="*" element={<Navigate to="/assets" replace />} />
      </Routes>
    </Layout>
  );
}
