import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                await loadUser(token);
            } else {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const loadUser = async (token) => {
        try {
            // Set default header for all subsequent requests
            axios.defaults.headers.common['x-auth-token'] = token;
            const res = await axios.get(`${API}/api/auth/me`);
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['x-auth-token'];
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post(`${API}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        await loadUser(res.data.token);
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
