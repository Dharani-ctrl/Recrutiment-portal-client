import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Settings from '../../components/Settings';
import { AuthContext } from '../../context/AuthContext';
import { Briefcase, Users, Settings as SettingsIcon, RefreshCw, Calendar, Search, MessageSquare, Edit3, Trash2, ArrowLeft, Award } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const CompanyDashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [editingQuestionsJob, setEditingQuestionsJob] = useState(null);
    const [questionsList, setQuestionsList] = useState([]);
    const [viewingResume, setViewingResume] = useState(null);

    const openQuestionsEditor = (job) => {
        // If the job already has customized questions, load them!
        if (job.questions && job.questions.length > 0) {
            setQuestionsList(JSON.parse(JSON.stringify(job.questions)));
        } else {
            // Pre-populate with auto-generated questions from our frontend list helper!
            const quantPool = [
                { questionText: "A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?", options: ["3 toffees", "4 toffees", "5 toffees", "6 toffees"], correctIndex: 2 },
                { questionText: "If 5 men or 9 women can do a piece of work in 19 days, then in how many days will 3 men and 6 women do the same work?", options: ["12 days", "15 days", "10 days", "18 days"], correctIndex: 2 },
                { questionText: "A train 125 m long passes a man, running at 5 km/hr in the same direction, in 10 seconds. Find the speed of the train.", options: ["45 km/hr", "50 km/hr", "55 km/hr", "60 km/hr"], correctIndex: 1 },
                { questionText: "Find the simple interest on Rs. 7200 at 8% per annum for 10 months.", options: ["Rs. 480", "Rs. 500", "Rs. 450", "Rs. 520"], correctIndex: 0 },
                { questionText: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?", options: ["3.6 km/h", "7.2 km/h", "8.4 km/h", "10 km/h"], correctIndex: 1 }
            ];
            const logicalPool = [
                { questionText: "Look at this series: 36, 34, 30, 28, 24, ... What number should come next?", options: ["20", "22", "23", "26"], correctIndex: 1 },
                { questionText: "Pointing to a photograph, Vipul said, 'She is the daughter of my grandfather's only son.' How is Vipul related to the girl?", options: ["Brother", "Uncle", "Cousin", "Father"], correctIndex: 0 },
                { questionText: "In a certain code, COMPUTER is written as OCPMTURE. How is OHMSLAW written in that code?", options: ["HOMSLWA", "HOSMLWA", "HOMSWAL", "HOMSLAW"], correctIndex: 0 },
                { questionText: "If Sunday is the first day of the month, what day will it be on the 25th day of that month?", options: ["Tuesday", "Wednesday", "Thursday", "Monday"], correctIndex: 1 },
                { questionText: "Complete the letter series: SCD, TEF, UGH, ____, WKL", options: ["VIJ", "VIK", "UJI", "IJT"], correctIndex: 0 }
            ];
            const verbalPool = [
                { questionText: "Choose the correct synonym of 'CANDID':", options: ["Vague", "Frank", "Devious", "Arrogant"], correctIndex: 1 },
                { questionText: "Choose the correct spelling:", options: ["Accomodate", "Accommodate", "Acomodate", "Accomoddat"], correctIndex: 1 },
                { questionText: "Find the antonym of the word 'AMBIGUOUS':", options: ["Clear", "Obscure", "Vague", "Doubtful"], correctIndex: 0 },
                { questionText: "Complete the sentence: 'The committee members were ______ in their decision to approve the budget.'", options: ["divided", "unanimous", "discordant", "hesitant"], correctIndex: 1 },
                { questionText: "Fill in the blank: 'Despite the heavy rain, the event went ______ as planned.'", options: ["off", "ahead", "through", "over"], correctIndex: 1 }
            ];

            const finalQs = [
                ...quantPool.slice(0, 4),
                ...logicalPool.slice(0, 3),
                ...verbalPool.slice(0, 3)
            ];
            setQuestionsList(finalQs);
        }
        setEditingQuestionsJob(job);
    };

    const saveCustomQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/company/jobs/${editingQuestionsJob._id}`, {
                ...editingQuestionsJob,
                questions: questionsList
            }, {
                headers: { 'x-auth-token': token }
            });
            alert('Aptitude Test Questions set successfully! Candidates will now take this assessment.');
            setEditingQuestionsJob(null);
            fetchJobs();
        } catch (err) {
            console.error(err);
            alert('Error saving custom questions');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchJobs(), fetchApplications()]);
        setTimeout(() => {
            setRefreshing(false);
            setShowStatus(true);
            setTimeout(() => setShowStatus(false), 2000);
        }, 500);
    };
    const [view, setView] = useState('jobs');
    const [showJobForm, setShowJobForm] = useState(false);
    const [jobData, setJobData] = useState({ title: '', description: '', skills: '', responsibilities: '', salary: '', location: '', workMode: 'Onsite' });
    const [searchQuery, setSearchQuery] = useState('');
    const [editingJobId, setEditingJobId] = useState(null);

    const [activeChat, setActiveChat] = useState(0);
    const [messageText, setMessageText] = useState('');
    const [chats, setChats] = useState([
        {
            name: 'Dharani (Candidate)',
            avatar: 'D',
            role: 'Applied for Frontend Developer',
            messages: [
                { sender: 'candidate', text: 'Hello! I completed my Aptitude Test. When can I expect the next round details?', time: '10:42 AM' },
                { sender: 'company', text: 'Hi Dharani! Great job, your score was highly impressive. We are setting up the Tech Interview next week.', time: '11:05 AM' }
            ]
        },
        {
            name: 'Sundar Pichai',
            avatar: 'S',
            role: 'Product Manager Applicant',
            messages: [
                { sender: 'candidate', text: 'Hi! Let me know if there are any specific guidelines for the case studies.', time: 'Yesterday' }
            ]
        }
    ]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;
        const newChats = [...chats];
        newChats[activeChat].messages.push({
            sender: 'company',
            text: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setChats(newChats);
        setMessageText('');
    };

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        if (path === '/company/jobs' || path === '/company') {
            setView('jobs');
        } else if (path === '/company/applications') {
            setView('applications');
        } else if (path === '/company/rounds') {
            setView('rounds');
        } else if (path === '/company/search') {
            setView('search');
        } else if (path === '/company/message') {
            setView('message');
        } else if (path === '/company/settings') {
            setView('settings');
        }
    }, [location]);

    useEffect(() => {
        if (location.pathname === '/company' || location.pathname === '/company/') {
            navigate('/company/jobs', { replace: true });
        }
    }, [location, navigate]);

    const handleViewChange = (newView) => {
        if (newView === 'jobs') {
            navigate('/company/jobs');
        } else if (newView === 'applications') {
            navigate('/company/applications');
        } else if (newView === 'rounds') {
            navigate('/company/rounds');
        } else if (newView === 'search') {
            navigate('/company/search');
        } else if (newView === 'message') {
            navigate('/company/message');
        } else if (newView === 'settings') {
            navigate('/company/settings');
        }
    };

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/company/jobs`, {
                headers: { 'x-auth-token': token }
            });
            setJobs(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/company/applications`, {
                headers: { 'x-auth-token': token }
            });
            const sortedApps = res.data.sort((a, b) => new Date(b.updatedAt || b.appliedAt) - new Date(a.updatedAt || a.appliedAt));
            setApplications(sortedApps);
        } catch (err) { console.error(err); }
    };

    const handleEditClick = (job) => {
        setEditingJobId(job._id);
        setJobData({
            title: job.title,
            description: job.description,
            skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills,
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join(', ') : job.responsibilities,
            salary: job.salary || '',
            location: job.location || '',
            workMode: job.workMode || 'Onsite'
        });
        setShowJobForm(true);
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job listing? This will also affect candidates applied for this position.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API}/api/company/jobs/${jobId}`, {
                    headers: { 'x-auth-token': token }
                });
                alert('Job listing deleted successfully');
                fetchJobs();
            } catch (err) {
                console.error(err);
                alert('Error deleting job listing');
            }
        }
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                ...jobData,
                skills: typeof jobData.skills === 'string' ? jobData.skills.split(',').map(s => s.trim()) : jobData.skills,
                responsibilities: typeof jobData.responsibilities === 'string' ? jobData.responsibilities.split(',').map(r => r.trim()) : jobData.responsibilities
            };
            
            if (editingJobId) {
                await axios.put(`${API}/api/company/jobs/${editingJobId}`, data, {
                    headers: { 'x-auth-token': token }
                });
                alert('Job listing updated successfully');
            } else {
                await axios.post(`${API}/api/company/jobs`, data, {
                    headers: { 'x-auth-token': token }
                });
                alert('Job listing published successfully');
            }

            fetchJobs();
            setShowJobForm(false);
            setEditingJobId(null);
            setJobData({ title: '', description: '', skills: '', responsibilities: '', salary: '', location: '', workMode: 'Onsite' });
        } catch (err) { alert('Error saving job listing'); }
    };

    const updateStatus = async (appId, status, round) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/company/applications/${appId}`,
                { status, currentRound: round },
                { headers: { 'x-auth-token': token } }
            );
            fetchApplications();
        } catch (err) { alert('Error updating status'); }
    };

    const navItems = [
        { label: 'Job Postings', view: 'jobs', icon: <Briefcase /> },
        { label: 'Applications', view: 'applications', icon: <Users /> },
        { label: 'Rounds', view: 'rounds', icon: <Award /> },
        { label: 'Message', view: 'message', icon: <MessageSquare /> },
        { label: 'Settings', view: 'settings', icon: <SettingsIcon /> },
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar
                brandName="RecruitCorp"
                brandSub="Hire the Best Talent"
                navItems={navItems}
                activeView={view}
                setView={handleViewChange}
            />

            <div className="main-content" style={{ paddingTop: '1.5rem' }}>
                {/* Sleek Top Navigation Bar displaying Company Name */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem', 
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                            background: 'rgba(58, 36, 181, 0.08)', 
                            color: 'var(--primary)',
                            padding: '0.5rem 0.65rem', 
                            borderRadius: '10px', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem'
                        }}>
                            🏢
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', display: 'block', marginBottom: '2px' }}>Active Workspace</span>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                {user?.companyId?.companyName || 'Corporate Partner'}
                            </h2>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button className="refresh-btn" onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Calendar size={14} color="var(--primary)" />
                            <span style={{ fontWeight: '500' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {view === 'settings' && (
                    <Settings />
                )}
                {view === 'jobs' && (
                    <div>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Company Job Dashboard</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Publish vacancies, evaluate talent applications, and drive organization-wide hiring.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => {
                                if (showJobForm) {
                                    setEditingJobId(null);
                                    setJobData({ title: '', description: '', skills: '', responsibilities: '', salary: '', location: '', workMode: 'Onsite' });
                                }
                                setShowJobForm(!showJobForm);
                            }}>
                                {showJobForm ? '← Back to Jobs' : '+ Post New Position'}
                            </button>
                        </div>

                        {!showJobForm && (() => {
                            const totalApps = applications.length;
                            const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
                            const activePostings = jobs.length;
                            const successRate = totalApps > 0 ? Math.round((shortlistedCount / totalApps) * 100) : 100;
                            return (
                                <div className="stats-grid-container">
                                    {/* Interviews Schedule Card */}
                                    <div className="stat-card-item stat-purple">
                                        <div>
                                            <div className="stat-title">Interviews Scheduled</div>
                                            <div className="stat-value">{shortlistedCount}</div>
                                        </div>
                                        <div className="stat-icon-wrapper">
                                            <Calendar size={24} />
                                        </div>
                                    </div>

                                    {/* Application Sent Card */}
                                    <div className="stat-card-item stat-blue">
                                        <div>
                                            <div className="stat-title">Applications Received</div>
                                            <div className="stat-value">{totalApps}</div>
                                        </div>
                                        <div className="stat-icon-wrapper">
                                            <Briefcase size={24} />
                                        </div>
                                    </div>

                                    {/* Profile Viewed Card */}
                                    <div className="stat-card-item stat-green">
                                        <div>
                                            <div className="stat-title">Active Postings</div>
                                            <div className="stat-value">{activePostings}</div>
                                        </div>
                                        <div className="stat-icon-wrapper">
                                            <Users size={24} />
                                        </div>
                                    </div>

                                    {/* Unread Message Card */}
                                    <div className="stat-card-item stat-lime">
                                        <div>
                                            <div className="stat-title">Success Rate</div>
                                            <div className="stat-value">{successRate}%</div>
                                        </div>
                                        <div className="stat-icon-wrapper">
                                            <SettingsIcon size={24} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {showJobForm ? (
                            <div className="glass-card animate-fade" style={{ maxWidth: '800px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setEditingJobId(null);
                                            setJobData({ title: '', description: '', skills: '', responsibilities: '', salary: '', location: '', workMode: 'Onsite' });
                                            setShowJobForm(false);
                                        }}
                                        style={{
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-main)',
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: 'var(--shadow)',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Back to Jobs List"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                        {editingJobId ? 'Edit Job Posting' : 'Create Job Posting'}
                                    </h3>
                                </div>
                                <form onSubmit={handleJobSubmit}>
                                    <div className="input-group">
                                        <label>Job Title *</label>
                                        <input type="text" value={jobData.title} onChange={e => setJobData({ ...jobData, title: e.target.value })} required placeholder="e.g. Senior Frontend Engineer" />
                                    </div>
                                    <div className="input-group">
                                        <label>Detailed Description *</label>
                                        <textarea rows="5" value={jobData.description} onChange={e => setJobData({ ...jobData, description: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Required Skills (Comma separated)</label>
                                        <input type="text" value={jobData.skills} onChange={e => setJobData({ ...jobData, skills: e.target.value })} placeholder="React, Tailwind, Node.js" />
                                    </div>
                                    <div className="input-group">
                                        <label>Salary (LPA or CTC Format) *</label>
                                        <input type="text" value={jobData.salary} onChange={e => setJobData({ ...jobData, salary: e.target.value })} required placeholder="e.g. 12 LPA or 12,00,000 CTC" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div className="input-group">
                                            <label>Work Location *</label>
                                            <input type="text" value={jobData.location} onChange={e => setJobData({ ...jobData, location: e.target.value })} required placeholder="e.g. Chennai, Bangalore" />
                                        </div>
                                        <div className="input-group" style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ marginBottom: '0.5rem' }}>Work Mode *</label>
                                            <select 
                                                value={jobData.workMode} 
                                                onChange={e => setJobData({ ...jobData, workMode: e.target.value })}
                                                required
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
                                            >
                                                <option value="Onsite">Onsite</option>
                                                <option value="Remote">Remote</option>
                                                <option value="Hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Responsibilities (Comma separated)</label>
                                        <textarea rows="3" value={jobData.responsibilities} onChange={e => setJobData({ ...jobData, responsibilities: e.target.value })} placeholder="Designing UI, Mentoring juniors..." />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button 
                                            type="button" 
                                            className="btn" 
                                            onClick={() => {
                                                setShowJobForm(false);
                                                setEditingJobId(null);
                                                setJobData({ title: '', description: '', skills: '', responsibilities: '', salary: '', location: '', workMode: 'Onsite' });
                                            }}
                                            style={{ border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)' }}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>
                                            {editingJobId ? 'Save Changes' : 'Publish Job'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="card-grid">
                                {jobs.map(job => (
                                    <div key={job._id} className="glass-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>{job.title}</h3>
                                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '12px', fontWeight: '600' }}>Live</span>
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
                                        <p style={{ margin: '1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {job.description}
                                        </p>
                                        {job.salary && (
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--success)', marginBottom: '0.75rem' }}>
                                                Salary: {job.salary}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                                            {job.skills.map(skill => (
                                                <span key={skill} style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>{skill}</span>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <button 
                                                className="btn" 
                                                onClick={() => handleDeleteJob(job._id)}
                                                style={{ fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                            <button 
                                                className="btn" 
                                                onClick={() => handleEditClick(job)}
                                                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '8px' }}
                                            >
                                                <Edit3 size={14} /> Edit Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {view === 'applications' && (
                    <div>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Candidate Pipeline</h1>
                                </div>
                                <p style={{ color: 'var(--text-muted)' }}>Track and move candidates through interview stages</p>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-light)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Candidate ID</th>
                                        <th style={{ padding: '1rem' }}>Candidate Name</th>
                                        <th style={{ padding: '1rem' }}>Applied Position</th>
                                        <th style={{ padding: '1rem' }}>Date Of Applied</th>
                                        <th style={{ padding: '1rem' }}>Resume</th>
                                        <th style={{ padding: '1rem' }}>Current Round</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map(app => (
                                        <tr key={app._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: '600', color: 'var(--primary)' }}>
                                                CAND-{(app.candidateId || app._id).slice(-6).toUpperCase()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600' }}>{app.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.email}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{app.jobId.title}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                {new Date(app.appliedAt || app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {app.resume ? (
                                                    <button onClick={() => setViewingResume(app.resume === 'https://resume-link.com/uploaded-resume.pdf' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : app.resume)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                                                        📄 View
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>N/A</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    background: app.status === 'Shortlisted' ? '#dcfce7' : '#fef9c3',
                                                    color: app.status === 'Shortlisted' ? '#166534' : '#854d0e',
                                                    fontWeight: '600'
                                                }}>
                                                    {app.currentRound}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {app.status === 'Applied' && (
                                                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={() => updateStatus(app._id, 'Shortlisted', 'Aptitude Test Round')}>Shortlist</button>
                                                )}
                                                {app.currentRound === 'Aptitude Test Round' && (
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: '600' }}>Test Pending</span>
                                                )}
                                                {app.status !== 'Rejected' && app.status !== 'Selected' ? (
                                                    <button className="btn" style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--danger)', background: '#fee2e2' }} onClick={() => updateStatus(app._id, 'Rejected', 'Rejected')}>Reject</button>
                                                ) : (
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Action Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {applications.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === 'search' && (() => {
                    const filteredJobs = jobs.filter(job => 
                        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
                    );
                    return (
                        <div>
                            <div className="section-header">
                                <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Corporate Talent Portal</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Search and source candidates across all premium registered agencies.</p>
                            </div>
                            
                            <div className="glass-card" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search for jobs by title, department, or keywords..." 
                                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                            </div>

                            <div className="card-grid">
                                {filteredJobs.map((job, idx) => {
                                    const compName = job.companyId?.name || user?.name || 'RecruitCorp';
                                    const badgeBg = job.workMode === 'Remote' ? 'rgba(56, 189, 248, 0.1)' : job.workMode === 'Hybrid' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(58, 36, 181, 0.1)';
                                    const badgeColor = job.workMode === 'Remote' ? '#0369a1' : job.workMode === 'Hybrid' ? '#a16207' : 'var(--primary)';
                                    
                                    return (
                                        <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', background: 'var(--card-bg)' }}>
                                            <div>
                                                {/* Header: Company Name & Brand Initials */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                                                        {compName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{compName}</h4>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Partner</span>
                                                    </div>
                                                </div>

                                                {/* Job Title / Role */}
                                                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.75rem' }}>{job.title}</h3>

                                                {/* Work Mode & Location Badges */}
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.7rem', padding: '3px 10px', background: badgeBg, color: badgeColor, borderRadius: '20px', fontWeight: '600' }}>
                                                        {job.workMode || 'Onsite'}
                                                    </span>
                                                    {job.location && (
                                                        <span style={{ fontSize: '0.7rem', padding: '3px 10px', background: 'var(--badge-bg)', color: 'var(--badge-text)', borderRadius: '20px', fontWeight: '600' }}>
                                                            📍 {job.location}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <p style={{ margin: '1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                                    {job.description}
                                                </p>

                                                {/* Skills chips */}
                                                {job.skills && job.skills.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem', marginBottom: '1.25rem' }}>
                                                        {job.skills.map(skill => (
                                                            <span key={skill} style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', border: '1px solid var(--border-color)' }}>{skill}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer: Salary and action tag */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offer Salary</span>
                                                    <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--success)' }}>
                                                        {job.salary || 'Competitive CTC'}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--bg-main)', color: 'var(--text-muted)', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '500' }}>
                                                    Active Listing
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredJobs.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No active jobs matched your search criteria.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {view === 'message' && (
                    <div>
                        <div className="section-header">
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Talent Communication</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Chat directly with shortlisted candidates and arrange interviews</p>
                        </div>
                        
                        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', padding: '0', height: '600px', overflow: 'hidden', borderRadius: '20px' }}>
                            {/* Chat Thread Panel */}
                            <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--card-bg)' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Active Chats</h3>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {chats.map((chat, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => setActiveChat(idx)}
                                            style={{ 
                                                padding: '1.25rem 1.5rem', 
                                                borderBottom: '1px solid var(--border-color)', 
                                                cursor: 'pointer', 
                                                background: activeChat === idx ? 'rgba(58, 36, 181, 0.08)' : 'transparent',
                                                display: 'flex',
                                                gap: '1rem',
                                                alignItems: 'center',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                                {chat.avatar}
                                            </div>
                                            <div style={{ flex: 1, minWidth: '0' }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Chat Conversation Panel */}
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)' }}>
                                <div style={{ padding: '1.25rem 1.5rem', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                        {chats[activeChat].avatar}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{chats[activeChat].name}</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{chats[activeChat].role}</p>
                                    </div>
                                </div>
                                
                                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {chats[activeChat].messages.map((msg, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                alignSelf: msg.sender === 'company' ? 'flex-end' : 'flex-start',
                                                background: msg.sender === 'company' ? 'var(--primary)' : 'var(--card-bg)',
                                                color: msg.sender === 'company' ? 'white' : 'var(--text-main)',
                                                padding: '0.75rem 1.25rem',
                                                borderRadius: msg.sender === 'company' ? '18px 18px 0px 18px' : '18px 18px 18px 0px',
                                                maxWidth: '70%',
                                                boxShadow: 'var(--shadow)'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{msg.text}</div>
                                            <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '0.25rem', opacity: 0.7 }}>{msg.time}</div>
                                        </div>
                                    ))}
                                </div>
                                
                                <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                                    <input 
                                        type="text" 
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                        placeholder="Type your message here..." 
                                        style={{ flex: 1, padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'rounds' && (() => {
                    const roundApps = applications.filter(a => ['Shortlisted', 'Selected', 'Rejected'].includes(a.status) || a.currentRound === 'Aptitude Round');
                    
                    return (
                        <div>
                            <div className="section-header">
                                <div>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Evaluation Rounds Portal</h1>
                                    <p style={{ color: 'var(--text-muted)' }}>Configure 10-Question Aptitude assessments per job role, and track test scores for shortlisted candidates.</p>
                                </div>
                            </div>

                            {/* Job Settings Block */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>⚙ Configure Aptitude Tests for Active Jobs</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                    {jobs.map(job => (
                                        <div key={job._id} className="glass-card" style={{ padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>{job.title}</h4>
                                                <span style={{ fontSize: '0.75rem', background: 'rgba(58, 36, 181, 0.08)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                                                    {job.questions?.length > 0 ? '✓ Custom Questions Configured' : '⚡ Using Automatic Generator'}
                                                </span>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                    Skills: {job.skills?.join(', ')}
                                                </div>
                                            </div>
                                            <button 
                                                className="btn btn-primary" 
                                                style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                                onClick={() => openQuestionsEditor(job)}
                                            >
                                                ⚙ Customise 10-Question Test
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Candidate Progress Block */}
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>👤 Shortlisted Candidates Progress</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {roundApps.map(app => (
                                        <div key={app._id} className="glass-card" style={{ padding: '1.75rem', background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>{app.name}</span>
                                                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(58, 36, 181, 0.08)', color: 'var(--primary)', borderRadius: '12px', fontWeight: '600' }}>
                                                            CAND-{(app.candidateId || app._id).slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email: {app.email}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>Applied for: <span style={{ color: 'var(--primary)' }}>{app.jobId?.title}</span></div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Round Status</span>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <span style={{
                                                            padding: '6px 16px',
                                                            borderRadius: '50px',
                                                            fontSize: '0.8rem',
                                                            background: (app.currentRound === 'Aptitude Round' || app.status === 'Selected') ? '#dcfce7' : 
                                                                        app.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                                                            color: (app.currentRound === 'Aptitude Round' || app.status === 'Selected') ? '#166534' : 
                                                                   app.status === 'Rejected' ? '#991b1b' : '#854d0e',
                                                            fontWeight: '700'
                                                        }}>
                                                            {app.status === 'Selected' ? '🎉 Selected' : 
                                                             app.status === 'Rejected' ? '❌ Rejected' : 
                                                             app.currentRound === 'Aptitude Round' ? '✅ Aptitude Test Completed' : 
                                                             '⏳ Aptitude Test Pending'}
                                                        </span>
                                                        
                                                        <span style={{
                                                            padding: '6px 16px',
                                                            borderRadius: '50px',
                                                            fontSize: '0.8rem',
                                                            background: (app.currentRound === 'Aptitude Round' || app.status === 'Selected' || app.status === 'Rejected') ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                                                            color: (app.currentRound === 'Aptitude Round' || app.status === 'Selected' || app.status === 'Rejected') ? 'white' : 'var(--text-muted)',
                                                            fontWeight: '700'
                                                        }}>
                                                            Score: {(app.currentRound === 'Aptitude Round' || app.status === 'Selected' || app.status === 'Rejected') ? `${app.testScore || 0}/10` : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Job Required Skills:</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {app.jobId?.skills?.map(skill => (
                                                        <span key={skill} style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid var(--border-color)', fontWeight: '500' }}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <details style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', cursor: 'pointer' }}>
                                                <summary style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)', outline: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', userSelect: 'none' }}>
                                                    📋 View Active 10-Question Aptitude Test for this Candidate
                                                </summary>
                                                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default' }}>
                                                    {(() => {
                                                        const getClientMockupQuestions = (skills, customQs) => {
                                                            if (customQs && customQs.length > 0) return customQs;
                                                            const quantPool = [
                                                                { questionText: "A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?", options: ["3 toffees", "4 toffees", "5 toffees", "6 toffees"], correctIndex: 2 },
                                                                { questionText: "If 5 men or 9 women can do a piece of work in 19 days, then in how many days will 3 men and 6 women do the same work?", options: ["12 days", "15 days", "10 days", "18 days"], correctIndex: 2 },
                                                                { questionText: "A train 125 m long passes a man, running at 5 km/hr in the same direction, in 10 seconds. Find the speed of the train.", options: ["45 km/hr", "50 km/hr", "55 km/hr", "60 km/hr"], correctIndex: 1 },
                                                                { questionText: "Find the simple interest on Rs. 7200 at 8% per annum for 10 months.", options: ["Rs. 480", "Rs. 500", "Rs. 450", "Rs. 520"], correctIndex: 0 },
                                                                { questionText: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?", options: ["3.6 km/h", "7.2 km/h", "8.4 km/h", "10 km/h"], correctIndex: 1 }
                                                            ];
                                                            const logicalPool = [
                                                                { questionText: "Look at this series: 36, 34, 30, 28, 24, ... What number should come next?", options: ["20", "22", "23", "26"], correctIndex: 1 },
                                                                { questionText: "Pointing to a photograph, Vipul said, 'She is the daughter of my grandfather's only son.' How is Vipul related to the girl?", options: ["Brother", "Uncle", "Cousin", "Father"], correctIndex: 0 },
                                                                { questionText: "In a certain code, COMPUTER is written as OCPMTURE. How is OHMSLAW written in that code?", options: ["HOMSLWA", "HOSMLWA", "HOMSWAL", "HOMSLAW"], correctIndex: 0 },
                                                                { questionText: "If Sunday is the first day of the month, what day will it be on the 25th day of that month?", options: ["Tuesday", "Wednesday", "Thursday", "Monday"], correctIndex: 1 },
                                                                { questionText: "Complete the letter series: SCD, TEF, UGH, ____, WKL", options: ["VIJ", "VIK", "UJI", "IJT"], correctIndex: 0 }
                                                            ];
                                                            const verbalPool = [
                                                                { questionText: "Choose the correct synonym of 'CANDID':", options: ["Vague", "Frank", "Devious", "Arrogant"], correctIndex: 1 },
                                                                { questionText: "Choose the correct spelling:", options: ["Accomodate", "Accommodate", "Acomodate", "Accomoddat"], correctIndex: 1 },
                                                                { questionText: "Find the antonym of the word 'AMBIGUOUS':", options: ["Clear", "Obscure", "Vague", "Doubtful"], correctIndex: 0 },
                                                                { questionText: "Complete the sentence: 'The committee members were ______ in their decision to approve the budget.'", options: ["divided", "unanimous", "discordant", "hesitant"], correctIndex: 1 },
                                                                { questionText: "Fill in the blank: 'Despite the heavy rain, the event went ______ as planned.'", options: ["off", "ahead", "through", "over"], correctIndex: 1 }
                                                            ];

                                                            const finalQs = [
                                                                ...quantPool.slice(0, 4),
                                                                ...logicalPool.slice(0, 3),
                                                                ...verbalPool.slice(0, 3)
                                                            ];
                                                            return finalQs;
                                                        };
                                                        
                                                        const questions = getClientMockupQuestions(app.jobId?.skills || [], app.jobId?.questions);
                                                        return questions.map((qObj, qIdx) => (
                                                            <div key={qIdx} style={{ padding: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                                                                    {qIdx + 1}. {qObj.questionText}
                                                                </div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                                                    {qObj.options.map((opt, optIdx) => (
                                                                        <div key={optIdx} style={{
                                                                            fontSize: '0.8rem',
                                                                            padding: '0.5rem 0.75rem',
                                                                            borderRadius: '6px',
                                                                            border: optIdx === qObj.correctIndex ? '1px solid #10b981' : '1px solid var(--border-color)',
                                                                            background: optIdx === qObj.correctIndex ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                                                            color: optIdx === qObj.correctIndex ? '#047857' : 'var(--text-muted)',
                                                                            fontWeight: optIdx === qObj.correctIndex ? '700' : '400'
                                                                        }}>
                                                                            {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === qObj.correctIndex && '✓ (Correct Answer)'}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </details>

                                            {/* Decision Action Buttons */}
                                            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Decision Actions:</span>
                                                {app.status === 'Selected' ? (
                                                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        🎉 Candidate Selected (Permanent Decision)
                                                    </span>
                                                ) : app.status === 'Rejected' ? (
                                                    <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        ❌ Candidate Rejected (Permanent Decision)
                                                    </span>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button 
                                                            className="btn" 
                                                            style={{ 
                                                                background: 'transparent',
                                                                color: '#10b981',
                                                                border: '1px solid #10b981',
                                                                padding: '0.5rem 1.25rem',
                                                                fontSize: '0.85rem',
                                                                borderRadius: '8px',
                                                                fontWeight: '700',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease-in-out'
                                                            }}
                                                            onClick={() => updateStatus(app._id, 'Selected', 'Selected')}
                                                        >
                                                            ✓ Select Candidate
                                                        </button>
                                                        <button 
                                                            className="btn" 
                                                            style={{ 
                                                                background: 'transparent',
                                                                color: '#ef4444',
                                                                border: '1px solid #ef4444',
                                                                padding: '0.5rem 1.25rem',
                                                                fontSize: '0.85rem',
                                                                borderRadius: '8px',
                                                                fontWeight: '700',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease-in-out'
                                                            }}
                                                            onClick={() => updateStatus(app._id, 'Rejected', 'Rejected')}
                                                        >
                                                            ❌ Reject Candidate
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {roundApps.length === 0 && (
                                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No candidates have been moved to evaluation rounds yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fullscreen Overlay Question Customizer Modal */}
                            {editingQuestionsJob && (
                                <div style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0,0,0,0.6)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 9999,
                                    padding: '2rem'
                                }}>
                                    <div className="glass-card" style={{
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '24px',
                                        width: '100%',
                                        maxWidth: '850px',
                                        maxHeight: '90vh',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Modal Header */}
                                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>⚙ Customize Aptitude Test: {editingQuestionsJob.title}</h3>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Configure exactly 10 aptitude questions to evaluate shortlisted talent.</p>
                                            </div>
                                            <button 
                                                onClick={() => setEditingQuestionsJob(null)}
                                                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Questions Scrollable Editor Content */}
                                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {questionsList.map((q, idx) => (
                                                <div key={idx} style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' }}>{idx + 1}</span>
                                                        <input 
                                                            type="text"
                                                            value={q.questionText}
                                                            onChange={(e) => {
                                                                const updated = [...questionsList];
                                                                updated[idx].questionText = e.target.value;
                                                                setQuestionsList(updated);
                                                            }}
                                                            style={{ flex: 1, padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-main)', outline: 'none' }}
                                                            placeholder={`Question ${idx + 1} Text`}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                                        {q.options.map((opt, oIdx) => (
                                                            <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <input 
                                                                    type="radio" 
                                                                    name={`correct-option-${idx}`}
                                                                    checked={q.correctIndex === oIdx}
                                                                    onChange={() => {
                                                                        const updated = [...questionsList];
                                                                        updated[idx].correctIndex = oIdx;
                                                                        setQuestionsList(updated);
                                                                    }}
                                                                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                                                                />
                                                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{String.fromCharCode(65 + oIdx)}</span>
                                                                <input 
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => {
                                                                        const updated = [...questionsList];
                                                                        updated[idx].options[oIdx] = e.target.value;
                                                                        setQuestionsList(updated);
                                                                    }}
                                                                    style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--card-bg)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }}
                                                                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Modal Footer */}
                                        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-main)' }}>
                                            <button 
                                                className="btn" 
                                                onClick={() => setEditingQuestionsJob(null)}
                                                style={{ border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.6rem 1.5rem', borderRadius: '10px' }}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                className="btn btn-primary" 
                                                onClick={saveCustomQuestions}
                                                style={{ padding: '0.6rem 2rem', borderRadius: '10px' }}
                                            >
                                                💾 Save Aptitude Test Questions
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
            
            {/* Resume Viewer Modal */}
            {viewingResume && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'var(--bg-main)', width: '80%', height: '90%', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>Candidate Resume</h3>
                            <button onClick={() => setViewingResume(null)} style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>X</button>
                        </div>
                        <iframe src={viewingResume} style={{ flex: 1, width: '100%', border: 'none', background: 'white' }} title="Resume Viewer" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyDashboard;
