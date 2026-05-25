import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Settings from '../../components/Settings';
import { Search, FolderOpen, Settings as SettingsIcon, RefreshCw, User } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const CandidateDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [view, setView] = useState('browse');
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', education: '', experience: '', skills: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [takingTest, setTakingTest] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [testQuestions, setTestQuestions] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(600);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        if (path === '/candidate/browse' || path === '/candidate') {
            setView('browse');
        } else if (path === '/candidate/applications') {
            setView('applications');
        } else if (path === '/candidate/profile') {
            setView('profile');
        } else if (path === '/candidate/settings') {
            setView('settings');
        }
    }, [location]);

    useEffect(() => {
        if (location.pathname === '/candidate' || location.pathname === '/candidate/') {
            navigate('/candidate/browse', { replace: true });
        }
    }, [location, navigate]);

    const handleViewChange = (newView) => {
        if (newView === 'browse') {
            navigate('/candidate/browse');
        } else if (newView === 'applications') {
            navigate('/candidate/applications');
        } else if (newView === 'profile') {
            navigate('/candidate/profile');
        } else if (newView === 'settings') {
            navigate('/candidate/settings');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchJobs(), fetchMyApplications()]);
        setTimeout(() => {
            setRefreshing(false);
            setShowStatus(true);
            setTimeout(() => setShowStatus(false), 2000);
        }, 500);
    };

    useEffect(() => {
        fetchJobs();
        fetchMyApplications();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            const userData = res.data;
            setProfile({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                education: userData.education || '',
                experience: userData.experience || '',
                skills: userData.skills ? userData.skills.join(', ') : ''
            });
        } catch (err) { console.error(err); }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/auth/profile`, profile, {
                headers: { 'x-auth-token': token }
            });
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/candidate/jobs`, {
                headers: { 'x-auth-token': token }
            });
            setJobs(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchMyApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/candidate/my-applications`, {
                headers: { 'x-auth-token': token }
            });
            const sortedApps = res.data.sort((a, b) => new Date(b.updatedAt || b.appliedAt) - new Date(a.updatedAt || a.appliedAt));
            setMyApplications(sortedApps);
        } catch (err) { console.error(err); }
    };

    const apply = async (jobId) => {
        try {
            const token = localStorage.getItem('token');
            const userRes = await axios.get(`${API}/api/auth/me`, { headers: { 'x-auth-token': token } });
            await axios.post(`${API}/api/candidate/apply`, {
                jobId,
                name: userRes.data.name,
                email: userRes.data.email,
                resume: 'https://resume-link.com/file.pdf'
            }, { headers: { 'x-auth-token': token } });
            alert('Applied Successfully!');
            fetchMyApplications();
            setView('applications');
        } catch (err) { alert('Already applied or error'); }
    };

    const startAptitudeTest = async (appId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/candidate/applications/${appId}/questions`, {
                headers: { 'x-auth-token': token }
            });
            setTestQuestions(res.data);
            setAnswers({});
            setCurrentQuestionIdx(0);
            setTimeLeft(600); // 10 minutes fixed time
            setTakingTest(appId);
        } catch (err) {
            alert('Failed to load aptitude test questions');
        }
    };

    const submitTest = async (appId) => {
        let correctCount = 0;
        testQuestions.forEach((q, idx) => {
            if (answers[idx] === q.correctIndex) {
                correctCount++;
            }
        });

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/candidate/test-result/${appId}`,
                { testScore: correctCount },
                { headers: { 'x-auth-token': token } }
            );
            setTakingTest(null);
            setTestQuestions([]);
            alert(`Aptitude Test Completed Successfully! You scored: ${correctCount} / 10.`);
            fetchMyApplications();
        } catch (err) { 
            alert('Error submitting test'); 
        }
    };

    useEffect(() => {
        if (!takingTest) return;
        if (timeLeft <= 0) {
            submitTest(takingTest);
            return;
        }
        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [takingTest, timeLeft]);

    const navItems = [
        { label: 'Browse Jobs', view: 'browse', icon: <Search /> },
        { label: 'My Applications', view: 'applications', icon: <FolderOpen /> },
        { label: 'My Profile', view: 'profile', icon: <User /> },
        { label: 'Settings', view: 'settings', icon: <SettingsIcon /> },
    ];

    if (takingTest && testQuestions.length > 0) {
        const currentQ = testQuestions[currentQuestionIdx];
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        
        return (
            <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-card animate-fade" style={{ maxWidth: '650px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', width: '100%', padding: '2.5rem', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(58, 36, 181, 0.08)', padding: '0.6rem', borderRadius: '12px', display: 'flex', fontSize: '1.5rem' }}>📝</div>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Aptitude Assessment</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Job-Specific Generated Interview Round</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ background: '#ffedd5', color: '#c2410c', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                ⏳ {minutes}:{seconds}
                            </div>
                            <div style={{ background: 'var(--primary)', color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' }}>
                                Question {currentQuestionIdx + 1} of {testQuestions.length}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                            {currentQ.questionText}
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {currentQ.options.map((opt, oIdx) => {
                                const isSelected = answers[currentQuestionIdx] === oIdx;
                                return (
                                    <label 
                                        key={oIdx} 
                                        style={{ 
                                            padding: '1.15rem 1.5rem', 
                                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                                            borderRadius: '16px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '1rem', 
                                            cursor: 'pointer',
                                            background: isSelected ? 'rgba(58, 36, 181, 0.04)' : 'var(--bg-main)',
                                            color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                                            fontWeight: isSelected ? '700' : '500',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input 
                                            type="radio" 
                                            name={`q-${currentQuestionIdx}`} 
                                            checked={isSelected}
                                            onChange={() => setAnswers({ ...answers, [currentQuestionIdx]: oIdx })}
                                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }} 
                                        />
                                        <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <button 
                            className="btn" 
                            disabled={currentQuestionIdx === 0}
                            onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                            style={{ 
                                padding: '0.75rem 1.5rem', 
                                borderRadius: '12px', 
                                border: '1px solid var(--border-color)', 
                                background: 'transparent', 
                                color: 'var(--text-muted)',
                                cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                                opacity: currentQuestionIdx === 0 ? 0.5 : 1
                            }}
                        >
                            Previous Question
                        </button>
                        
                        {currentQuestionIdx < testQuestions.length - 1 ? (
                            <button 
                                className="btn btn-primary"
                                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                                style={{ padding: '0.75rem 2rem', borderRadius: '12px' }}
                            >
                                Next Question
                            </button>
                        ) : (
                            <button 
                                className="btn btn-success"
                                onClick={() => submitTest(takingTest)}
                                style={{ 
                                    padding: '0.75rem 2rem', 
                                    borderRadius: '12px',
                                    background: 'var(--success)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                Submit Test Answers
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar 
                brandName="RecruitMe" 
                brandSub="Find Your Dream Career"
                navItems={navItems}
                activeView={view}
                setView={handleViewChange}
            />

            <div className="main-content">
                {view === 'settings' ? (
                    <Settings />
                ) : view === 'browse' ? (
                    <div>
                        <div className="section-header">
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Recommended for you</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Based on your profile and search history</p>
                        </div>
                        <div className="card-grid">
                            {jobs.map(job => (
                                <div key={job._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="user-avatar" style={{ borderRadius: '10px', background: '#e0e7ff', color: '#4338ca' }}>
                                                {(job.companyId?.companyName || 'C').charAt(0)}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{job.title}</h3>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>{job.companyId?.companyName || 'Unknown Company'}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(58, 36, 181, 0.1)', color: 'var(--primary)', borderRadius: '12px', fontWeight: '600' }}>
                                                {job.workMode || 'Onsite'}
                                            </span>
                                            {job.location && (
                                                <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'var(--badge-bg)', color: 'var(--badge-text)', borderRadius: '12px', fontWeight: '600' }}>
                                                    📍 {job.location}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {job.description}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {job.skills.slice(0, 3).map(skill => (
                                                <span key={skill} style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)', border: '1px solid var(--border-light)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>{skill}</span>
                                            ))}
                                        </div>
                                        {job.salary && (
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--success)', marginTop: '0.75rem' }}>
                                                Salary: {job.salary}
                                            </div>
                                        )}
                                    </div>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => navigate(`/candidate/apply/${job._id}`)}>Quick Apply</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : view === 'profile' ? (
                    <div>
                        <div className="section-header">
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>My Profile</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and professional background</p>
                        </div>
                        <div className="glass-card" style={{ maxWidth: '800px' }}>
                            <form onSubmit={handleProfileSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Full Name</label>
                                        <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} required style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', width: '100%' }} />
                                    </div>
                                    <div className="input-group">
                                        <label>Email Address</label>
                                        <input type="email" value={profile.email} disabled style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', width: '100%', opacity: 0.7 }} />
                                    </div>
                                    <div className="input-group">
                                        <label>Phone Number</label>
                                        <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+1 234 567 890" style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', width: '100%' }} />
                                    </div>
                                    <div className="input-group">
                                        <label>Highest Education</label>
                                        <input type="text" value={profile.education} onChange={e => setProfile({...profile, education: e.target.value})} placeholder="e.g. B.Tech in Computer Science" style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', width: '100%' }} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginTop: '1rem' }}>
                                    <label>Professional Experience</label>
                                    <textarea rows="3" value={profile.experience} onChange={e => setProfile({...profile, experience: e.target.value})} placeholder="Describe your past roles, companies, and achievements..." style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', width: '100%' }} />
                                </div>
                                <div className="input-group" style={{ marginTop: '1rem' }}>
                                    <label>Skills (Comma separated)</label>
                                    <input type="text" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="React, Node.js, Python, Project Management" style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', width: '100%' }} />
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                                        {savingProfile ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="section-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>My Applications</h1>
                            </div>
                            <p style={{ color: 'var(--text-muted)' }}>Monitor the status of your current job applications</p>
                        </div>
                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-light)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Job Title</th>
                                        <th style={{ padding: '1rem' }}>Application ID</th>
                                        <th style={{ padding: '1rem' }}>Applied On</th>
                                        <th style={{ padding: '1rem' }}>Current Status</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myApplications.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>You haven't applied to any jobs yet.</td>
                                        </tr>
                                    )}
                                    {myApplications.map(app => (
                                        <tr key={app._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '600' }}>{app.jobId.title}</td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: '600' }}>#{app._id.slice(-6).toUpperCase()}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '4px 12px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.75rem', 
                                                    background: app.status === 'Selected' ? '#dcfce7' : 
                                                                app.status === 'Rejected' ? '#fee2e2' :
                                                                app.status === 'Shortlisted' ? '#e0e7ff' : 'var(--badge-bg)',
                                                    color: app.status === 'Selected' ? '#166534' : 
                                                           app.status === 'Rejected' ? '#991b1b' :
                                                           app.status === 'Shortlisted' ? '#3730a3' : 'var(--badge-text)',
                                                    fontWeight: '600'
                                                }}>
                                                    {app.status === 'Selected' ? 'Selected' : 
                                                     app.status === 'Rejected' ? 'Rejected' : 
                                                     app.currentRound}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {app.status === 'Selected' && <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem' }}>🎉 Selected</span>}
                                                {app.status === 'Rejected' && <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.85rem' }}>❌ Rejected</span>}
                                                {app.status !== 'Selected' && app.status !== 'Rejected' && app.currentRound === 'Aptitude Test Round' && (
                                                    <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => startAptitudeTest(app._id)}>Start Test</button>
                                                )}
                                                {app.status !== 'Selected' && app.status !== 'Rejected' && app.currentRound === 'Aptitude Round' && (
                                                    <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.85rem' }}>✅ Completed</span>
                                                )}
                                                {app.status !== 'Selected' && app.status !== 'Rejected' && app.currentRound === 'Technical Round' && (
                                                    <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.85rem' }}>✅ Pending Interview</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateDashboard;
