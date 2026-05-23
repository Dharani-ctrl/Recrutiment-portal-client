import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import QuickApplyPage from './pages/candidate/QuickApplyPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/admin/*" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/company/*" element={
              <ProtectedRoute roles={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />

            {/* Quick Apply page — separate full-screen route */}
            <Route path="/candidate/apply/:jobId" element={
              <ProtectedRoute roles={['candidate']}>
                <QuickApplyPage />
              </ProtectedRoute>
            } />

            <Route path="/candidate/*" element={
              <ProtectedRoute roles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />

            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

const HomeRedirect = () => {
    const { user, loading } = React.useContext(AuthContext);
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'admin')   return <Navigate to="/admin" />;
    if (user.role === 'company') return <Navigate to="/company" />;
    return <Navigate to="/candidate" />;
};

export default App;
