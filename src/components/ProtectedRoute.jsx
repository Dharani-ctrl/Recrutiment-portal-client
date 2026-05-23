import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
            <div className="spinning" style={{ border: '4px solid #e2e8f0', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px' }}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Verifying Session...</p>
        </div>
    );

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles.length && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
