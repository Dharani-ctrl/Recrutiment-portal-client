import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    User, 
    Lock, 
    Bell, 
    ShieldCheck, 
    HelpCircle, 
    Phone, 
    ChevronRight,
    Eye,
    EyeOff,
    Mail,
    Save,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Send,
    MessageSquare,
    AlertTriangle,
    ArrowLeft
} from 'lucide-react';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [activeSubView, setActiveSubView] = useState('menu'); // 'menu', 'editProfile', 'changePassword', 'notifications', 'privacy', 'helpCenter', 'contact'
    
    // Status Messages
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ==========================================
    // 1. EDIT PROFILE FORM STATE
    // ==========================================
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileEmail, setProfileEmail] = useState(user?.email || '');
    const [profilePhone, setProfilePhone] = useState('9876543210');
    const [profileBio, setProfileBio] = useState('We are dedicated to building great software and discovering exceptional talent globally.');

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setSubmitting(true);

        try {
            // Simulated API update with standard delay
            setTimeout(() => {
                setSuccessMsg('Profile updated successfully!');
                setSubmitting(false);
                setTimeout(() => {
                    setActiveSubView('menu');
                    setSuccessMsg('');
                }, 1500);
            }, 1000);
        } catch (err) {
            setErrorMsg('Failed to update profile.');
            setSubmitting(false);
        }
    };

    // ==========================================
    // 2. CHANGE PASSWORD FORM STATE
    // ==========================================
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const passwordRequirements = [
        { label: 'At least 8 characters', met: newPassword.length >= 8 },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
        { label: 'Contains number', met: /[0-9]/.test(newPassword) },
        { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) }
    ];

    const allPasswordRequirementsMet = passwordRequirements.every(req => req.met);

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!allPasswordRequirementsMet) {
            setErrorMsg('Please satisfy all password requirements first.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('New password and confirm password do not match.');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/auth/change-password', {
                currentPassword,
                newPassword
            }, {
                headers: { 'x-auth-token': token }
            });

            setSuccessMsg(res.data.msg || 'Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            setTimeout(() => {
                setActiveSubView('menu');
                setSuccessMsg('');
            }, 1500);
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Incorrect current password or server error.');
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // 3. NOTIFICATIONS TOGGLES STATE
    // ==========================================
    const [notifPreferences, setNotifPreferences] = useState({
        emailApps: true,
        emailAlerts: false,
        emailMessages: true,
        desktopPush: true
    });

    const handleNotifToggle = (key) => {
        setNotifPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSaveNotifs = () => {
        setSuccessMsg('Notification preferences saved successfully!');
        setTimeout(() => {
            setActiveSubView('menu');
            setSuccessMsg('');
        }, 1500);
    };

    // ==========================================
    // 4. PRIVACY & SECURITY STATE
    // ==========================================
    const [profileVisibility, setProfileVisibility] = useState('Public');
    const [twoFA, setTwoFA] = useState(false);

    const handleSavePrivacy = () => {
        setSuccessMsg('Privacy preferences saved successfully!');
        setTimeout(() => {
            setActiveSubView('menu');
            setSuccessMsg('');
        }, 1500);
    };

    // ==========================================
    // 5. HELP CENTER FAQ ACCORDION STATE
    // ==========================================
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const faqs = [
        {
            q: 'How do I post a new job?',
            a: 'Go to your Company Dashboard, make sure you are in the Job Postings tab, and click "+ Post New Position" at the top right.'
        },
        {
            q: 'How are candidates shortlisted?',
            a: 'In the Applications tab, view applying candidates and click "Shortlist" to invite them to the Aptitude Test Round.'
        },
        {
            q: 'Where do I find my temporary generated passwords?',
            a: 'The temporary credentials for registered partner organizations are automatically created and displayed inside the Admin Companies Management console upon registry.'
        },
        {
            q: 'How do I toggle Dark Mode?',
            a: 'You can swap between light and dark backgrounds instantaneously by toggling the "Display Mode" switch on the bottom left sidebar.'
        }
    ];

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    // ==========================================
    // 6. CONTACT SUPPORT FORM STATE
    // ==========================================
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setSubmitting(true);

        setTimeout(() => {
            setSuccessMsg('Your support request has been sent! We will contact you soon.');
            setContactSubject('');
            setContactMessage('');
            setSubmitting(false);
            setTimeout(() => {
                setActiveSubView('menu');
                setSuccessMsg('');
            }, 2000);
        }, 1200);
    };


    // ==========================================
    // MENU ITEMS MAPPING
    // ==========================================
    const settingItems = [
        {
            category: 'Account',
            items: [
                { label: 'Edit Profile', Icon: User, color: '#e0e7ff', textColor: '#4338ca', subView: 'editProfile' },
                { label: 'Change Password', Icon: Lock, color: '#fef3c7', textColor: '#92400e', subView: 'changePassword' },
                { label: 'Notifications', Icon: Bell, color: '#dcfce7', textColor: '#166534', subView: 'notifications' },
                { label: 'Privacy & Security', Icon: ShieldCheck, color: '#fee2e2', textColor: '#991b1b', subView: 'privacy' },
            ]
        },
        {
            category: 'Support',
            items: [
                { label: 'Help Center', Icon: HelpCircle, color: '#f1f5f9', textColor: '#475569', subView: 'helpCenter' },
                { label: 'Contact Us', Icon: Phone, color: '#f1f5f9', textColor: '#475569', subView: 'contact' },
            ]
        }
    ];

    const renderHeader = (iconBg, iconColor, LucideIcon, title, subtitle) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button 
                type="button"
                onClick={() => setActiveSubView('menu')}
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow)',
                    transition: 'all 0.2s',
                    marginRight: '0.25rem'
                }}
                title="Back to Settings"
            >
                <ArrowLeft size={20} />
            </button>

            <div style={{ 
                background: iconBg, 
                color: iconColor, 
                width: '52px', 
                height: '52px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 4px 10px ${iconColor}20`
            }}>
                <LucideIcon size={28} />
            </div>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>{title}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0 0' }}>{subtitle}</p>
            </div>
        </div>
    );

    const renderActions = (onCancel, submitText, isSubmitDisabled) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
            <button 
                type="button"
                onClick={onCancel}
                className="btn"
                style={{ 
                    flex: 1, 
                    background: 'transparent', 
                    color: 'var(--text-muted)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '30px',
                    padding: '0.85rem'
                }}
            >
                Cancel
            </button>
            <button 
                type="submit"
                disabled={isSubmitDisabled || submitting}
                className="btn btn-primary"
                style={{ 
                    flex: 1.5, 
                    background: isSubmitDisabled ? '#cbd5e1' : '#2bb673',
                    color: 'white',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '0.85rem',
                    opacity: submitting ? 0.7 : 1,
                    cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                    boxShadow: isSubmitDisabled ? 'none' : '0 10px 15px -3px rgba(43, 182, 115, 0.3)'
                }}
            >
                {submitting ? 'Saving...' : submitText}
            </button>
        </div>
    );

    // ==========================================
    // RENDER SUB VIEWS
    // ==========================================
    
    // 1. Edit Profile View
    if (activeSubView === 'editProfile') {
        return (
            <div className="settings-container animate-fade" style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem' }}>
                {renderHeader('#e0e7ff', '#4338ca', User, 'Edit Profile', 'Update your personal profile details')}
                
                <form onSubmit={handleProfileSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-color)' }}>
                    {successMsg && (
                        <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem' }}>
                            {successMsg}
                        </div>
                    )}

                    <div className="input-group">
                        <label style={{ color: 'var(--text-main)', fontWeight: '600' }}>Full Name</label>
                        <input 
                            type="text" 
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            required
                            style={{ padding: '0.85rem 1.25rem', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ color: 'var(--text-main)', fontWeight: '600' }}>Email Address</label>
                        <input 
                            type="email" 
                            value={profileEmail}
                            onChange={e => setProfileEmail(e.target.value)}
                            required
                            style={{ padding: '0.85rem 1.25rem', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ color: 'var(--text-main)', fontWeight: '600' }}>Contact Number</label>
                        <input 
                            type="text" 
                            value={profilePhone}
                            onChange={e => setProfilePhone(e.target.value)}
                            required
                            style={{ padding: '0.85rem 1.25rem', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ color: 'var(--text-main)', fontWeight: '600' }}>Professional Bio / Description</label>
                        <textarea 
                            rows="4" 
                            value={profileBio}
                            onChange={e => setProfileBio(e.target.value)}
                            style={{ padding: '0.85rem 1.25rem', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                        />
                    </div>

                    {renderActions(() => setActiveSubView('menu'), 'Save Changes', false)}
                </form>
            </div>
        );
    }

    // 2. Change Password View (Strictly matching reference image)
    if (activeSubView === 'changePassword') {
        return (
            <div className="settings-container animate-fade" style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
                {renderHeader('#dcfce7', '#166534', ShieldCheck, 'Change Password', 'Update your account password')}

                <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {errorMsg && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem' }}>
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem' }}>
                            {successMsg}
                        </div>
                    )}

                    {/* Current Password Card */}
                    <div style={{ 
                        border: '1px solid #d1fae5', 
                        background: 'var(--card-bg)', 
                        borderRadius: '16px', 
                        padding: '1.5rem 2rem', 
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' 
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Current Password</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Enter your current password</p>
                        
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Lock size={18} />
                            </span>
                            <input 
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="Current password"
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '0.85rem 3.5rem 0.85rem 3rem',
                                    borderRadius: '30px', 
                                    border: '1px solid var(--border-color)', 
                                    background: 'var(--bg-main)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                style={{ 
                                    position: 'absolute', 
                                    right: '1.25rem', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    border: 'none', 
                                    background: 'none', 
                                    color: 'var(--text-muted)', 
                                    cursor: 'pointer' 
                                }}
                            >
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password Card */}
                    <div style={{ 
                        border: '1px solid #d1fae5', 
                        background: 'var(--card-bg)', 
                        borderRadius: '16px', 
                        padding: '2rem', 
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>New Password</h3>
                        
                        {/* Enter New Password */}
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Enter new password</p>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="New password"
                                    required
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.85rem 3.5rem 0.85rem 3rem',
                                        borderRadius: '30px', 
                                        border: '1px solid var(--border-color)', 
                                        background: 'var(--bg-main)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    style={{ 
                                        position: 'absolute', 
                                        right: '1.25rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        border: 'none', 
                                        background: 'none', 
                                        color: 'var(--text-muted)', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Confirm new password</p>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.85rem 3.5rem 0.85rem 3rem',
                                        borderRadius: '30px', 
                                        border: '1px solid var(--border-color)', 
                                        background: 'var(--bg-main)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    style={{ 
                                        position: 'absolute', 
                                        right: '1.25rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        border: 'none', 
                                        background: 'none', 
                                        color: 'var(--text-muted)', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div style={{ 
                            background: 'var(--bg-main)', 
                            borderRadius: '12px', 
                            padding: '1.25rem 1.5rem', 
                            marginTop: '0.5rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                                Password Requirements:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                                        <div style={{ 
                                            width: '10px', 
                                            height: '10px', 
                                            borderRadius: '50%', 
                                            background: req.met ? '#10b981' : '#cbd5e1',
                                            transition: 'background 0.3s'
                                        }} />
                                        <span style={{ 
                                            color: req.met ? 'var(--text-main)' : 'var(--text-muted)', 
                                            fontWeight: req.met ? '600' : '400',
                                            transition: 'color 0.3s'
                                        }}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {renderActions(() => setActiveSubView('menu'), 'Update Password', !allPasswordRequirementsMet)}
                </form>
            </div>
        );
    }

    // 3. Notifications View
    if (activeSubView === 'notifications') {
        return (
            <div className="settings-container animate-fade" style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem' }}>
                {renderHeader('#dcfce7', '#166534', Bell, 'Notifications', 'Manage your real-time notification alerts')}
                
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-color)' }}>
                    {successMsg && (
                        <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem' }}>
                            {successMsg}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { key: 'emailApps', title: 'Applications Activity', desc: 'Get emails about applicant status updates and interview round scheduling' },
                            { key: 'emailAlerts', title: 'Weekly Talent Summary', desc: 'Receive summarized weekly job alert emails matching open mandates' },
                            { key: 'emailMessages', title: 'Candidate Direct Chats', desc: 'Notify me immediately via email for direct messages' },
                            { key: 'desktopPush', title: 'Real-time Desktop Alerts', desc: 'Enable push alerts inside browser notifications' }
                        ].map(item => (
                            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ flex: 1, paddingRight: '1rem' }}>
                                    <h4 style={{ color: 'var(--text-main)', fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>{item.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{item.desc}</p>
                                </div>
                                <button 
                                    onClick={() => handleNotifToggle(item.key)}
                                    style={{
                                        width: '46px',
                                        height: '24px',
                                        borderRadius: '15px',
                                        background: notifPreferences[item.key] ? '#10b981' : '#cbd5e1',
                                        border: 'none',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'background 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        position: 'absolute',
                                        top: '3px',
                                        left: notifPreferences[item.key] ? '25px' : '3px',
                                        transition: 'left 0.3s'
                                    }} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {renderActions(() => setActiveSubView('menu'), 'Save Preferences', false)}
                </div>
            </div>
        );
    }

    // 4. Privacy & Security View
    if (activeSubView === 'privacy') {
        return (
            <div className="settings-container animate-fade" style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem' }}>
                {renderHeader('#fee2e2', '#991b1b', ShieldCheck, 'Privacy & Security', 'Configure account security and access guidelines')}
                
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-color)' }}>
                    {successMsg && (
                        <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem' }}>
                            {successMsg}
                        </div>
                    )}

                    <div className="input-group" style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>Profile Access Level</label>
                        <select 
                            value={profileVisibility} 
                            onChange={e => setProfileVisibility(e.target.value)}
                            style={{ padding: '0.85rem 1.25rem', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none' }}
                        >
                            <option value="Public">Public (All verified users can find)</option>
                            <option value="Partners">Partners Only (Only registered networks)</option>
                            <option value="Private">Private (Invisible on corporate search)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ flex: 1, paddingRight: '1rem' }}>
                            <h4 style={{ color: 'var(--text-main)', fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>Two-Factor Authentication (2FA)</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Enforce security codes from authentication application upon login</p>
                        </div>
                        <button 
                            onClick={() => setTwoFA(!twoFA)}
                            style={{
                                width: '46px',
                                height: '24px',
                                borderRadius: '15px',
                                background: twoFA ? '#10b981' : '#cbd5e1',
                                border: 'none',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background 0.3s'
                            }}
                        >
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: '3px',
                                  left: twoFA ? '25px' : '3px',
                                transition: 'left 0.3s'
                            }} />
                        </button>
                    </div>

                    {/* Dangerous Action Zone */}
                    <div style={{ border: '1px solid #fee2e2', background: 'rgba(254,226,226,0.3)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: '700', marginBottom: '0.5rem' }}>
                            <AlertTriangle size={18} />
                            Danger Zone
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#7f1d1d', margin: '0 0 1rem 0' }}>Once you request account deletion, all active postings, historical applications, and data will be permanently wiped.</p>
                        <button 
                            type="button"
                            onClick={() => alert('Account deletion has been disabled for safety reasons on demo workspace.')}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Request Deletion
                        </button>
                    </div>

                    {renderActions(() => setActiveSubView('menu'), 'Save Preferences', false)}
                </div>
            </div>
        );
    }

    // 5. Help Center FAQ View (Interactive accordion)
    if (activeSubView === 'helpCenter') {
        return (
            <div className="settings-container animate-fade" style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem' }}>
                {renderHeader('#f1f5f9', '#475569', HelpCircle, 'Help Center', 'Find answers to common platform queries')}
                
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Frequently Asked Questions</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {faqs.map((faq, index) => {
                            const isExpanded = expandedFAQ === index;
                            return (
                                <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div 
                                        onClick={() => toggleFAQ(index)}
                                        style={{ 
                                            padding: '1rem 1.25rem', 
                                            background: isExpanded ? 'rgba(58, 36, 181, 0.04)' : 'var(--bg-main)', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-main)',
                                            userSelect: 'none'
                                        }}
                                    >
                                        <span>{faq.q}</span>
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                    {isExpanded && (
                                        <div style={{ padding: '1.25rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button 
                            onClick={() => setActiveSubView('menu')}
                            className="btn"
                            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '0.75rem 1.5rem', color: 'var(--text-muted)' }}
                        >
                            Return to Settings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 6. Contact Us Form View
    if (activeSubView === 'contact') {
        return (
            <div className="settings-container animate-fade" style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem' }}>
                {renderHeader('#f1f5f9', '#475569', Phone, 'Contact Support', 'Get in touch with our operations center')}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                    <form onSubmit={handleContactSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-color)' }}>
                        {successMsg && (
                            <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem' }}>
                                {successMsg}
                            </div>
                        )}

                        <div className="input-group">
                            <label style={{ color: 'var(--text-main)', fontWeight: '600' }}>Subject / Reason *</label>
                            <input 
                                type="text" 
                                value={contactSubject}
                                onChange={e => setContactSubject(e.target.value)}
                                required
                                placeholder="e.g. Account Verification Issue"
                                style={{ padding: '0.85rem 1.25rem', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ color: 'var(--text-main)', fontWeight: '600' }}>Explain details *</label>
                            <textarea 
                                rows="5" 
                                value={contactMessage}
                                onChange={e => setContactMessage(e.target.value)}
                                required
                                placeholder="Provide complete particulars about your inquiry..."
                                style={{ padding: '0.85rem 1.25rem', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                            />
                        </div>

                        {renderActions(() => setActiveSubView('menu'), 'Send Ticket', false)}
                    </form>

                    {/* Support Sidebar Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Support Center</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={16} />
                                    <span>support@recruitcorp.com</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Phone size={16} />
                                    <span>+1 (800) 555-RECRUIT</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageSquare size={16} />
                                    <span>Mon-Fri: 9 AM - 6 PM</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'rgba(58, 36, 181, 0.03)' }}>
                            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>24/7 Ticketing</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>All submitted request tickets will automatically generate a dedicated support tracking ID and are addressed inside 24 hours.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default Main Menu Settings List
    return (
        <div className="settings-container animate-fade">
            <div className="section-header">
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your account settings and preferences</p>
            </div>

            <div className="profile-card">
                <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{user?.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</div>
                    <span style={{ 
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        padding: '2px 10px',
                        background: '#dcfce7',
                        color: '#166534',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                    }}>
                        {user?.role?.toUpperCase()}
                    </span>
                </div>
                <ChevronRight className="chevron" size={20} />
            </div>

            {settingItems.map((section) => (
                <div key={section.category} className="settings-section">
                    <h4>{section.category}</h4>
                    <div className="settings-list">
                        {section.items.map((item) => (
                            <div 
                                key={item.label} 
                                className="settings-item" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    if (item.subView) {
                                        setActiveSubView(item.subView);
                                    }
                                }}
                            >
                                <div className="setting-info">
                                    <div className="icon-box" style={{ background: item.color, color: item.textColor }}>
                                        <item.Icon size={20} />
                                    </div>
                                    <div style={{ fontWeight: '600' }}>{item.label}</div>
                                </div>
                                <ChevronRight className="chevron" size={18} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Settings;
