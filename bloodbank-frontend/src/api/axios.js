import axios from 'axios';

// ✅ Base Axios Instance
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Centralized Base URL
    timeout: 15000, // 15s timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// ✅ Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Attach JWT
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Response Interceptor: Global Error Handling
api.interceptors.response.use(
    (response) => response.data, // Return data directly (optional, but cleaner)
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data || 'Something went wrong';

        if (status === 401) {
            // Unauthorized -> Logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/')) {
                window.location.href = '/'; // Redirect to login
            }
        }

        if (status === 403) {
            console.error("Access Denied: You don't have permission.");
            // Ideally trigger a toast here
        }

        console.error(`API Error [${status}]: ${message}`);
        return Promise.reject(error.response?.data || error); // Propagate error for UI handling
    }
);

export default api;
