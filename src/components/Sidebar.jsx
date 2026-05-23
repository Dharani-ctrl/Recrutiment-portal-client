import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu, X, Sun, Moon, GraduationCap, Building2, BarChart3 } from 'lucide-react';

const Sidebar = ({ brandName, brandSub, navItems, activeView, setView }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = (view) => {
        setView(view);
        setMobileOpen(false);
    };

    const getMobileHeaderConfig = () => {
        if (user?.role === 'admin') {
            return {
                icon: <BarChart3 size={20} style={{ color: 'var(--primary)' }} />,
                text: 'RecruitAdmin'
            };
        } else if (user?.role === 'company') {
            return {
                icon: <Building2 size={20} style={{ color: 'var(--primary)' }} />,
                text: 'Company Portal'
            };
        } else {
            return {
                icon: <GraduationCap size={20} style={{ color: 'var(--primary)' }} />,
                text: 'RecruitPortal'
            };
        }
    };

    const headerConfig = getMobileHeaderConfig();

    return (
        <>
            {/* Mobile Header */}
            <div className="mobile-header" style={{ 
                display: 'flex', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                background: 'var(--card-bg)',
                borderBottom: '1px solid var(--border-color)',
                width: '100%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <button 
                    onClick={() => setMobileOpen(true)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', padding: 0 }}
                >
                    <Menu size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                        background: 'rgba(58, 36, 181, 0.08)', 
                        padding: '0.4rem', 
                        borderRadius: '8px', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {headerConfig.icon}
                    </div>
                    <span style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '700' }}>
                        {headerConfig.text}
                    </span>
                </div>
            </div>

            {/* Mobile Overlay */}
            <div 
                className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} 
                onClick={() => setMobileOpen(false)}
            ></div>

            {/* Sidebar */}
            <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div className="sidebar-brand" style={{ marginBottom: 0, textAlign: 'left' }}>
                        <h2>{brandName}</h2>
                        <p>{brandSub}</p>
                    </div>
                    {/* Close button for mobile only */}
                    <button 
                        className="mobile-close-btn"
                        onClick={() => setMobileOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'none' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="nav-links">
                    {navItems.map((item) => (
                        <div 
                            key={item.view}
                            className={`nav-item ${activeView === item.view ? 'active' : ''}`}
                            onClick={() => handleNavClick(item.view)}
                        >
                            <span className="sidebar-icon-container">{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {/* Theme Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-main)', borderRadius: '50px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Mode</span>
                        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--card-bg)', padding: '0.25rem', borderRadius: '50px', border: '1px solid var(--border-color)' }}>
                            <div 
                                onClick={() => setTheme('light')}
                                style={{ padding: '0.25rem', borderRadius: '50%', cursor: 'pointer', background: theme === 'light' ? 'var(--primary)' : 'transparent', color: theme === 'light' ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Sun size={14} />
                            </div>
                            <div 
                                onClick={() => setTheme('dark')}
                                style={{ padding: '0.25rem', borderRadius: '50%', cursor: 'pointer', background: theme === 'dark' ? 'var(--primary)' : 'transparent', color: theme === 'dark' ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Moon size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="user-profile">
                        <div className="user-avatar" style={{ overflow: 'hidden' }}>
                            {user?.companyId?.logo ? (
                                <img src={user.companyId.logo} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (user?.companyId?.companyName || user?.name || 'C').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user?.companyId?.companyName || user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {user?.role === 'company' && user?.companyId?.companyName ? `${user?.name} (HR Head)` : user?.role}
                            </div>
                        </div>
                    </div>
                    <div className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        Logout
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
