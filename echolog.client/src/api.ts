import axios from 'axios';

//  !!!!! You need to add .env inside the echolog.clien with --> VITE_API_URL=https://localhost:5000/api or domain name if you are using one !!!!!
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
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
