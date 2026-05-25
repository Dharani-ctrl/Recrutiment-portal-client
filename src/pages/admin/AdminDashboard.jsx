import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Settings from '../../components/Settings';
import { LayoutDashboard, Building2, Settings as SettingsIcon, RefreshCw, Users, Bell, UserPlus, Calendar, ChevronLeft, ChevronRight, Search, Lock } from 'lucide-react';
import { NotificationContext } from '../../context/NotificationContext';

const API = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
    const [companies, setCompanies] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [view, setView] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Organizations');
    const [isEditing, setIsEditing] = useState(false);
    const [editCompanyId, setEditCompanyId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [passwordSuffix, setPasswordSuffix] = useState('');

    const generateRandomAlphanumeric = (length) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        if (path === '/admin/dashboard' || path === '/admin') {
            setView('dashboard');
        } else if (path === '/admin/managecompanies') {
            setView('companies');
        } else if (path === '/admin/settings') {
            setView('settings');
        } else if (path === '/admin/candidates') {
            setView('candidates');
        }
    }, [location]);

    useEffect(() => {
        if (location.pathname === '/admin' || location.pathname === '/admin/') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [location, navigate]);

    const handleViewChange = (newView) => {
        if (newView === 'dashboard') {
            navigate('/admin/dashboard');
        } else if (newView === 'companies') {
            navigate('/admin/managecompanies');
        } else if (newView === 'settings') {
            navigate('/admin/settings');
        } else if (newView === 'candidates') {
            navigate('/admin/candidates');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchCompanies(), fetchCandidates()]);
        setTimeout(() => {
            setRefreshing(false);
            setShowStatus(true);
            setTimeout(() => setShowStatus(false), 2000);
        }, 500);
    };
    const { showNotification } = React.useContext(NotificationContext);
    const [formData, setFormData] = useState({
        companyName: '',
        founderName: '',
        manager: '',
        hrName: '',
        email: '',
        location: '',
        description: '',
        password: '',
        logo: ''
    });

    const handleCompanyNameChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            companyName: value,
            password: value
        }));
    };

    useEffect(() => {
        fetchCompanies();
        fetchCandidates();
    }, []);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/admin/companies`, {
                headers: { 'x-auth-token': token }
            });
            setCompanies(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCandidates = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/admin/candidates`, {
                headers: { 'x-auth-token': token }
            });
            setCandidates(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (isEditing) {
                await axios.put(`${API}/api/admin/companies/${editCompanyId}`, formData, {
                    headers: { 'x-auth-token': token }
                });
                showNotification('Company profile updated successfully', 'success');
            } else {
                await axios.post(`${API}/api/admin/companies`, formData, {
                    headers: { 'x-auth-token': token }
                });
                showNotification('Company registered successfully', 'success');
            }
            fetchCompanies();
            setShowForm(false);
            setIsEditing(false);
            setEditCompanyId(null);
            setFormData({ companyName: '', founderName: '', manager: '', hrName: '', email: '', location: '', description: '', password: '', logo: '' });
        } catch (err) {
            const errorMsg = err.response?.data?.error || (isEditing ? 'Error updating company' : 'Error creating company');
            showNotification(errorMsg, 'error');
        }
    };

    const handleEditClick = (company) => {
        setFormData({
            companyName: company.companyName || '',
            founderName: company.founderName || '',
            manager: company.manager || '',
            hrName: company.hrName || '',
            email: company.email || '',
            location: company.location || '',
            description: company.description || '',
            logo: company.logo || ''
        });
        setIsEditing(true);
        setEditCompanyId(company._id);
        setShowForm(true);
    };

    const handleSuspend = async (id) => {
        if (window.confirm("Are you sure you want to suspend/delete this company profile? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API}/api/admin/companies/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                showNotification('Company suspended successfully', 'info');
                fetchCompanies();
            } catch (err) {
                showNotification('Error suspending company', 'error');
            }
        }
    };

    const navItems = [
        { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard /> },
        { label: 'Manage Companies', view: 'companies', icon: <Building2 /> },
        { label: 'Candidates', view: 'candidates', icon: <Users /> },
        { label: 'System Settings', view: 'settings', icon: <SettingsIcon /> },
    ];

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " yrs ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " mos ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hrs ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " sec ago";
    };

    const getChartData = () => {
        const months = [];
        for (let i = 4; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({ m: d.toLocaleDateString('en-US', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), c: 0, p: 0 });
        }
        companies.forEach(comp => {
            if (!comp.createdAt) return;
            const date = new Date(comp.createdAt);
            const entry = months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
            if (entry) entry.c++;
        });
        candidates.forEach(cand => {
            if (!cand.createdAt) return;
            const date = new Date(cand.createdAt);
            const entry = months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
            if (entry) entry.p++;
        });
        let maxVal = Math.max(...months.map(m => Math.max(m.c, m.p)), 10);
        return { months, maxVal };
    };

    const getRecentActivity = () => {
        const activities = [];
        companies.forEach(comp => {
            if (!comp.createdAt) return;
            activities.push({
                type: 'company', icon: <Building2 size={16} />, color: 'var(--primary)', bg: 'rgba(79,70,229,0.1)',
                text: <>Company <b style={{color:'var(--primary)'}}>'{comp.companyName}'</b> registered</>,
                date: new Date(comp.createdAt), time: timeAgo(new Date(comp.createdAt))
            });
        });
        candidates.forEach(cand => {
            if (!cand.createdAt) return;
            activities.push({
                type: 'candidate', icon: <UserPlus size={16} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)',
                text: <>Candidate <b style={{color:'#10b981'}}>'{cand.name}'</b> registered</>,
                date: new Date(cand.createdAt), time: timeAgo(new Date(cand.createdAt))
            });
        });
        return activities.sort((a, b) => b.date - a.date).slice(0, 4);
    };

    const getNewCompanies = () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return companies
            .filter(c => c.createdAt && new Date(c.createdAt) >= sevenDaysAgo)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const chartDataObj = getChartData();
    const chartData = chartDataObj.months;
    const chartMax = chartDataObj.maxVal;
    const recentActivity = getRecentActivity();
    const newCompaniesList = getNewCompanies();

    return (
        <div className="dashboard-layout">
            <Sidebar 
                brandName="RecruitAdmin" 
                brandSub="Portal Management System"
                navItems={navItems}
                activeView={view}
                setView={handleViewChange}
            />

            <div className="main-content">
                {view === 'dashboard' ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h1 style={{ fontSize: '1.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                    Good morning, Admin <span role="img" aria-label="wave">👋</span>
                                </h1>
                                <p style={{ color: 'var(--text-muted)' }}>Here's what's happening on your recruitment platform today.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem', boxShadow: 'var(--shadow)' }}>
                                    <Calendar size={16} color="var(--primary)" />
                                    <span style={{ fontWeight: '500' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}>
                                    <Bell size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2.5rem' }}>
                            <div className="glass-card" style={{ padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <Building2 size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{companies.length}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>Companies</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <Users size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{candidates.length}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>Candidates</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <Building2 size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{companies.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>New Today</p>
                            </div>
                        </div>

                        {/* Charts and Activity */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Monthly Platform Growth</h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></span> Companies</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></span> Candidates</div>
                                    </div>
                                </div>
                                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        <span>{chartMax}</span><span>{Math.floor(chartMax * 0.8)}</span><span>{Math.floor(chartMax * 0.6)}</span><span>{Math.floor(chartMax * 0.4)}</span><span>{Math.floor(chartMax * 0.2)}</span><span>0</span>
                                    </div>
                                    <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'flex-end', marginLeft: '2rem', height: '100%', alignSelf: 'stretch' }}>
                                        {chartData.map((data, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '100%' }}>
                                                <div style={{ width: '20px', background: 'var(--primary)', height: `${(data.c / chartMax) * 100}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                                    <span style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.m}</span>
                                                </div>
                                                <div style={{ width: '20px', background: '#10b981', height: `${(data.p / chartMax) * 100}%`, borderRadius: '4px 4px 0 0' }}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Recent Platform Activity</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: i !== recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                            <div style={{ background: activity.bg, color: activity.color, padding: '0.6rem', borderRadius: '10px' }}>
                                                {activity.icon}
                                            </div>
                                            <div style={{ flex: 1, fontSize: '0.9rem' }}>{activity.text}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activity.time}</div>
                                        </div>
                                    )) : (
                                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No recent activity</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Companies Table */}
                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>New Company Registrations (Last 7 Days)</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--bg-main)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Company Name</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Founder Name</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Registered By</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Date</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Status</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {newCompaniesList.length > 0 ? newCompaniesList.map((comp, i) => (
                                        <tr key={comp._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{comp.companyName}</td>
                                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{comp.founderName}</td>
                                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>System Admin</td>
                                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{new Date(comp.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{ background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '600' }}>Active</span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setView('companies')}>👁</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No new registrations in the last 7 days.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : view === 'settings' ? (
                    <Settings />
                ) : view === 'candidates' ? (
                    <>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Candidates Management</h1>
                                </div>
                                <p style={{ color: 'var(--text-muted)' }}>Overview of all registered candidates</p>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-light)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Candidate Details</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Date of Registration</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Companies Applied</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Role</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map(candidate => (
                                        <tr key={candidate._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div className="user-avatar" style={{ borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', width: '40px', height: '40px' }}>
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{candidate.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{candidate.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                {new Date(candidate.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {candidate.companiesApplied && candidate.companiesApplied.length > 0 ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {candidate.companiesApplied.map((company, index) => (
                                                            <span key={index} style={{ 
                                                                fontSize: '0.75rem', 
                                                                background: 'rgba(58, 36, 181, 0.08)', 
                                                                color: 'var(--primary)', 
                                                                padding: '2px 8px', 
                                                                borderRadius: '20px',
                                                                fontWeight: '500'
                                                            }}>
                                                                {company}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None yet</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', background: 'rgba(79, 70, 229, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                                                    {candidate.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button className="btn" style={{ fontSize: '0.8rem', border: '1px solid var(--border-light)', background: 'var(--card-bg)', color: 'var(--text-main)' }}>View Profile</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {candidates.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No candidates found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Companies Management</h1>
                                </div>
                                <p style={{ color: 'var(--text-muted)' }}>Overview of all registered organizations</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => {
                                if (showForm) {
                                    setIsEditing(false);
                                    setEditCompanyId(null);
                                    setFormData({ companyName: '', founderName: '', manager: '', hrName: '', email: '', location: '', description: '', password: '' });
                                } else {
                                    const suffix = generateRandomAlphanumeric(6);
                                    setPasswordSuffix(suffix);
                                    setFormData({ companyName: '', founderName: '', manager: '', hrName: '', email: '', location: '', description: '', password: '' });
                                }
                                setShowForm(!showForm);
                            }}>
                                {showForm ? '← Back to List' : '+ Add New Company'}
                            </button>
                        </div>

                        {showForm ? (
                            <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>{isEditing ? 'Edit Company Profile' : 'Company Information'}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {isEditing ? 'Modify the details below to update the company profile.' : 'Enter the details to create a new company profile and HR account.'}
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label>Company Name *</label>
                                <input 
                                    type="text" 
                                    value={formData.companyName} 
                                    onChange={handleCompanyNameChange} 
                                    required 
                                    placeholder="e.g. Google" 
                                />
                            </div>
                            <div className="input-group">
                                <label>Company Logo</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({...formData, logo: reader.result});
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }} 
                                    style={{ padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                />
                                {formData.logo && <img src={formData.logo} alt="Preview" style={{ marginTop: '0.5rem', width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />}
                            </div>
                            <div className="input-group">
                                <label>Founder Name *</label>
                                <input type="text" value={formData.founderName} onChange={e => setFormData({...formData, founderName: e.target.value})} required placeholder="e.g. Larry Page" />
                            </div>
                            <div className="input-group">
                                <label>Manager Name</label>
                                <input type="text" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} placeholder="e.g. Sundar Pichai" />
                            </div>
                            <div className="input-group">
                                <label>HR Contact Name *</label>
                                <input type="text" value={formData.hrName} onChange={e => setFormData({...formData, hrName: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Official Email *</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="hr@company.com" />
                            </div>
                            <div className="input-group">
                                <label>Primary Location</label>
                                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. New York, USA" />
                            </div>
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label>Company Brief</label>
                                <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="A short overview of the company..." />
                            </div>
                            {!isEditing && (
                                <div className="input-group" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ margin: 0, fontWeight: '600' }}>Login Password *</label>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input 
                                            type="text" 
                                            value={formData.password} 
                                            onChange={e => setFormData({...formData, password: e.target.value})} 
                                            required 
                                            style={{ paddingLeft: '2.5rem' }}
                                            placeholder="Login password will default to company name..."
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Temporary password. Share securely with the company's HR admin.
                                    </p>
                                </div>
                            )}
                            <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }}>{isEditing ? 'Update Profile' : 'Register Company'}</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Quick Access and Search</label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search for companies..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>
                            </div>
                            <div style={{ minWidth: '200px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Filter by Status</label>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', appearance: 'auto', cursor: 'pointer' }}
                                >
                                    <option value="All Organizations">All Organizations</option>
                                    <option value="Active">Active</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', alignSelf: 'flex-end', paddingBottom: '0.75rem' }}>
                                Viewing {companies.filter(c => (statusFilter === 'All Organizations' || 'Active' === statusFilter) && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())).length} Organizations
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--bg-main)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Company Details</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Founder</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>HR Head</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies
                                        .filter(c => (statusFilter === 'All Organizations' || 'Active' === statusFilter) && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(company => (
                                        <tr key={company._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div className="user-avatar" style={{ borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                                                        {company.logo ? (
                                                            <img src={company.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            company.companyName.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{company.companyName}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{company.location || 'Location Not Provided'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-main)', fontWeight: '500' }}>
                                                {company.founderName}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                                                {company.hrName}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '600' }}>Active</span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button 
                                                        className="btn" 
                                                        style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--text-main)' }}
                                                        onClick={() => handleEditClick(company)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn" 
                                                        style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626', padding: '0.4rem 0.8rem', border: 'none' }}
                                                        onClick={() => handleSuspend(company._id)}
                                                    >
                                                        Suspend
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {companies.filter(c => (statusFilter === 'All Organizations' || 'Active' === statusFilter) && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No companies found matching your criteria.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
