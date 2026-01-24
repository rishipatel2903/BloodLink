import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

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
        try {
            const data = await authApi.login(credentials);
            if (!data.token) throw new Error("No token received");

            // 🛡️ SECURITY: Enforce Role Validation
            // Backend returns ROLE_USER or ROLE_ORG. Frontend passes USER or ORG.
            const expectedRole = role === 'ORG' ? 'ROLE_ORG' : 'ROLE_USER';

            if (data.role !== expectedRole) {
                // Prevent login if roles mismatch
                throw new Error(`Access Denied: You cannot login as an ${role === 'ORG' ? 'Organization' : 'Individual'} with this account.`);
            }

            const userData = { ...data, role: data.role };
            setUser(userData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            throw error; // Let UI handle it
        }
    };

    // ✅ REGISTER USER
    const registerUser = async (data) => {
        return await authApi.registerUser(data);
    };

    // ✅ REGISTER ORGANIZATION
    const registerOrg = async (data) => {
        return await authApi.registerOrg(data);
    };

    // ✅ VERIFY OTP
    const verifyOtp = async (email, otp) => {
        return await authApi.verifyOtp(email, otp);
    };

    // ✅ GOOGLE LOGIN
    const googleLogin = async (token) => {
        try {
            const data = await authApi.googleLogin(token);
            const userData = { ...data, role: data.role };
            setUser(userData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerUser, registerOrg, verifyOtp, googleLogin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
