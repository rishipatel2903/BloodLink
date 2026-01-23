import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // ✅ LOGIN
    const login = async (role, credentials) => {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        const userData = { ...data, role: data.role };
        setUser(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    // ✅ REGISTER USER (SEND OTP)
    const registerUser = async (data) => {
        const response = await fetch('http://localhost:8080/api/auth/register/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(await response.text());
        return await response.text();
    };

    // ✅ REGISTER ORGANIZATION
    const registerOrg = async (data) => {
        const response = await fetch('http://localhost:8080/api/auth/register/org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(await response.text());
        return await response.text();
    };

    // ✅ VERIFY OTP
    const verifyOtp = async (email, otp) => {
        const response = await fetch(
            `http://localhost:8080/api/auth/verify-otp?email=${email}&otp=${otp}`,
            { method: 'POST' }
        );

        if (!response.ok) throw new Error(await response.text());
        return await response.text();
    };

    // ✅ GOOGLE LOGIN
    const googleLogin = async (token) => {
        const response = await fetch('http://localhost:8080/api/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        const userData = { ...data, role: data.role };
        setUser(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerUser, registerOrg, verifyOtp, googleLogin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
