import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Use the configured Axios instance

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        const expires = localStorage.getItem('jwt_expires');
        if (token && expires && new Date(expires) > new Date()) {
            navigate('/dashboard');
        }
    }, [navigate]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call the login endpoint defined in AuthController.cs
            const response = await api.post('/auth/login', { username, password });

            if (response.data && response.data.token && response.data.expires) {
                localStorage.setItem('jwt_token', response.data.token);
                localStorage.setItem('jwt_expires', response.data.expires);
                navigate('/dashboard'); // Redirect on success
            } else {
                setError('Login failed: Invalid response from server.');
            }
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                setError('Login failed: Invalid username or password.'); // From backend
            } else if (err.request) {
                setError('Login failed: No response from server. Please try again later.');
            }
            else {
                console.error("Login error:", err);
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-login-gradient px-4">

            <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in glow-box">


                <div className="flex flex-col items-center mb-6">
                    <img
                        src="/logo_echolog.png"
                        alt="EchoLog Logo"
                        className="w-16 h-16 mb-2 rounded"
                    />
                    <h1 className="text-3xl font-bold text-neutral-100 tracking-tight">Welcome to EchoLog</h1>
                    <p className="text-sm text-neutral-400 mt-1">Access restricted. Authorized users only.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-neutral-700 text-neutral-100 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-neutral-700 text-neutral-100 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-150 ${loading
                            ? 'bg-neutral-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>

    );
};

export default LoginPage;