import api from './axios';

export const authApi = {
    // Login
    login: (credentials) => api.post('/auth/login', credentials),

    // Register
    registerUser: (data) => api.post('/auth/register/user', data),
    registerOrg: (data) => api.post('/auth/register/org', data),

    // OTP
    verifyOtp: (email, otp) => api.post(`/auth/verify-otp?email=${email}&otp=${otp}`),

    // Google
    googleLogin: (token) => api.post('/auth/google-login', { token }),

    // Fallback/Utility
    getCurrentUser: (id) => api.get(`/users/${id}`),
};
