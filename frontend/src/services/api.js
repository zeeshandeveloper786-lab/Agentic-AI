import axios from 'axios';

const api = axios.create({
    // Use the environment variable or fallback to /api for relative calls
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Add ngrok-skip-browser-warning header for direct calls (if any)
        config.headers['ngrok-skip-browser-warning'] = 'true';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
