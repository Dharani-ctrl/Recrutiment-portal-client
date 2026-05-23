import React, { createContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success', // 'success', 'error', 'info'
    });

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification((prev) => ({ ...prev, show: false }));
        }, 3000); // hide after 3 seconds
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification.show && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    color: notification.type === 'error' ? '#ef4444' : notification.type === 'success' ? '#1d4ed8' : '#334155',
                    padding: '16px 32px',
                    borderRadius: '8px', // rectangular shape
                    minWidth: '350px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    zIndex: 9999,
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    animation: 'slideDownFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <style>
                        {`
                        @keyframes slideDownFade {
                            0% { transform: translate(-50%, -100%); opacity: 0; }
                            100% { transform: translate(-50%, 0); opacity: 1; }
                        }
                        `}
                    </style>
                    {notification.type === 'success' && <CheckCircle2 size={20} color="#0f172a" fill="#f8fafc" style={{ color: '#1e293b' }} />}
                    {notification.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
                    {notification.type === 'info' && <Info size={20} color="#3b82f6" />}
                    <span style={{ color: notification.type === 'success' ? '#1d4ed8' : notification.type === 'error' ? '#ef4444' : '#1e293b' }}>
                        {notification.message}
                    </span>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
