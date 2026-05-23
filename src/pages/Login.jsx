import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Building2, Eye, EyeOff, UserCircle2 } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'company') navigate('/company');
            else navigate('/candidate');
        } catch (err) {
            showNotification('Invalid Credentials', 'error');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {/* Left Side - Branding */}
            <div style={{
                flex: 1,
                backgroundColor: '#1d4ed8', // A professional blue color
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    color: '#1d4ed8'
                }}>
                    <Building2 size={48} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>RecruitPro</h1>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Advanced Talent Acquisition System</p>
                <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8, maxWidth: '400px' }}>
                    Streamline your hiring process, manage candidates efficiently, and find the perfect fit for your organization.
                </p>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                padding: '2rem'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(29, 78, 216, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(29, 78, 216, 0.2)'
                        }}>
                            <UserCircle2 size={48} color="#1d4ed8" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', textAlign: 'center' }}>Log In</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem', textAlign: 'center' }}>Welcome back! Please enter your details.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <Mail size={18} />
                                </span>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    placeholder="example@example.com" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem 1rem',
                                        paddingLeft: '3rem',
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    placeholder="Enter your password" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem 1rem',
                                        paddingLeft: '3rem',
                                        paddingRight: '3rem',
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ cursor: 'pointer' }} />
                                Remember me
                            </label>
                            <span style={{ fontSize: '0.875rem', color: '#1d4ed8', fontWeight: '600', cursor: 'pointer' }}>Forgot password?</span>
                        </div>

                        <button type="submit" style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: '#1d4ed8', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontSize: '1rem', 
                            fontWeight: '600', 
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}>
                            Log In
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                        Don't have an account? <span style={{ color: '#1d4ed8', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/register')}>Register</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
