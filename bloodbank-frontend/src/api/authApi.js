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

    // Hospital specific
    registerHospital: (data) => api.post('/hospital/register', data),
    loginHospital: (credentials) => api.post('/hospital/login', credentials),
    verifyHospitalOtp: (email, otp) => api.post(`/hospital/verify-otp?email=${email}&otp=${otp}`),

    // Fallback/Utility
    getCurrentUser: (id) => api.get(`/auth/user/${id}`),
};
