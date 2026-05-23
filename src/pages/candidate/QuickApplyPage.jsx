import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const QuickApplyPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        education: [{ degree: '', institution: '', year: '', grade: '' }],
        experience: [{ company: '', role: '', years: '', current: false }],
        resume: null
    });
    const [resumeFileName, setResumeFileName] = useState('');
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/candidate/jobs/${jobId}`, {
                    headers: { 'x-auth-token': token }
                });
                setJob(res.data);
                
                const userRes = await axios.get('http://localhost:5000/api/auth/me', { 
                    headers: { 'x-auth-token': token } 
                });
                setFormData(prev => ({
                    ...prev,
                    name: userRes.data.name || '',
                    email: userRes.data.email || ''
                }));
            } catch (err) {
                console.error(err);
                alert('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, resume: reader.result }));
            };
            reader.readAsDataURL(file);
            
            // Simulate AI Resume Parsing / Auto-fill
            setTimeout(() => {
                setFormData(prev => ({
                    ...prev,
                    mobile: prev.mobile || '+91 9876543210',
                    education: [
                        { degree: 'B.Tech in Computer Science', institution: 'Anna University', year: '2023', grade: '8.5 CGPA' }
                    ],
                    experience: [
                        { company: 'Tech Solutions Inc', role: 'Software Intern', years: '1', current: false }
                    ]
                }));
                alert('Resume analyzed! Details auto-filled from your resume.');
            }, 1500);
        }
    };

    const handleEducationChange = (index, field, value) => {
        const newEdu = [...formData.education];
        newEdu[index][field] = value;
        setFormData({ ...formData, education: newEdu });
    };

    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, { degree: '', institution: '', year: '', grade: '' }]
        });
    };

    const removeEducation = (index) => {
        const newEdu = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEdu });
    };

    const handleExperienceChange = (index, field, value) => {
        const newExp = [...formData.experience];
        newExp[index][field] = value;
        setFormData({ ...formData, experience: newExp });
    };

    const addExperience = () => {
        setFormData({
            ...formData,
            experience: [...formData.experience, { company: '', role: '', years: '', current: false }]
        });
    };

    const removeExperience = (index) => {
        const newExp = formData.experience.filter((_, i) => i !== index);
        setFormData({ ...formData, experience: newExp });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApplying(true);
        try {
            const token = localStorage.getItem('token');
            // Sending simulated uploaded file URL since we don't have a backend storage yet
            await axios.post('http://localhost:5000/api/candidate/apply', {
                jobId,
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                education: formData.education,
                experience: formData.experience,
                resume: formData.resume || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
            }, { 
                headers: { 'x-auth-token': token } 
            });
            alert('Application Submitted Successfully!');
            navigate('/candidate/applications');
        } catch (err) {
            alert(err.response?.data?.error || 'Error submitting application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    if (!job) return <div style={{ padding: '2rem', textAlign: 'center' }}>Job not found</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button 
                    onClick={() => navigate('/candidate')} 
                    className="btn" 
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="glass-card animate-fade" style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '2.5rem', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)' }}>
                    <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Apply for {job.title}</h1>
                        <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{job.companyId?.companyName}</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        <div style={{ background: 'rgba(58, 36, 181, 0.04)', border: '2px dashed var(--primary)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
                            <Upload size={32} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Upload your Resume</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>We'll automatically extract your details to save you time.</p>
                            
                            <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                Choose File
                                <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
                            </label>
                            {resumeFileName && <p style={{ marginTop: '1rem', color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>✅ {resumeFileName}</p>}
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Basic Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>Full Name</label>
                                    <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>Email Address</label>
                                    <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>Mobile Number</label>
                                    <input type="tel" className="form-input" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Education</h3>
                                <button type="button" onClick={addEducation} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                                    <Plus size={16} /> Add Education
                                </button>
                            </div>
                            {formData.education.map((edu, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1rem', position: 'relative', border: '1px solid var(--border-color)' }}>
                                    {formData.education.length > 1 && (
                                        <button type="button" onClick={() => removeEducation(idx)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>Degree/Course</label>
                                            <input type="text" value={edu.degree} onChange={e => handleEducationChange(idx, 'degree', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>Institution</label>
                                            <input type="text" value={edu.institution} onChange={e => handleEducationChange(idx, 'institution', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>Passing Year</label>
                                            <input type="text" value={edu.year} onChange={e => handleEducationChange(idx, 'year', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>Grade/CGPA</label>
                                            <input type="text" value={edu.grade} onChange={e => handleEducationChange(idx, 'grade', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Experience (Optional)</h3>
                                <button type="button" onClick={addExperience} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                                    <Plus size={16} /> Add Experience
                                </button>
                            </div>
                            {formData.experience.map((exp, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1rem', position: 'relative', border: '1px solid var(--border-color)' }}>
                                    {formData.experience.length > 1 && (
                                        <button type="button" onClick={() => removeExperience(idx)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>Company Name</label>
                                            <input type="text" value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>Role/Designation</label>
                                            <input type="text" value={exp.role} onChange={e => handleExperienceChange(idx, 'role', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>Years of Experience</label>
                                            <input type="text" value={exp.years} onChange={e => handleExperienceChange(idx, 'years', e.target.value)} placeholder="e.g. 2" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                                <input type="checkbox" checked={exp.current} onChange={e => handleExperienceChange(idx, 'current', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                                                I currently work here
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={applying || !resumeFileName}
                            style={{ 
                                padding: '1rem', 
                                fontSize: '1.1rem', 
                                borderRadius: '12px', 
                                marginTop: '1rem',
                                opacity: (applying || !resumeFileName) ? 0.7 : 1,
                                cursor: (applying || !resumeFileName) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {applying ? 'Submitting Application...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuickApplyPage;
