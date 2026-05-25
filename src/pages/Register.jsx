import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Building2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/auth/register`, { ...formData, role: 'candidate' });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            alert('User already exists or error');
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
                    Join our platform to discover top opportunities, connect with great companies, and accelerate your career growth.
                </p>
            </div>

            {/* Right Side - Register Form */}
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
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>Get started by creating your candidate profile.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <User size={18} />
                                </span>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    placeholder="John Doe" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem 1rem 0.75rem 2.5rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <Mail size={18} />
                                </span>
                                <input 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    required 
                                    placeholder="example@example.com" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem 1rem 0.75rem 2.5rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type="password" 
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                    required 
                                    placeholder="Create a strong password" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem 1rem 0.75rem 2.5rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
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
                            Register
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                        Already have an account? <span style={{ color: '#1d4ed8', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/login')}>Log In</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
