import axios from 'axios';

// Dynamic base URL switching based on mode
const API_BASE_URL = import.meta.env.MODE === 'development'
    ? '/api' 
    : '/api'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('jwt_expires');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            console.warn('JWT expired or invalid. Redirecting to login.');
        }

        return Promise.reject(error);
    }
);

export default api;
