import { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { UserProvider, useUser } from '../components/UserContext';

const Topbar: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin, username } = useUser();

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_expires');
        navigate('/login');
    };

    return (
        <nav className="bg-neutral-900 text-neutral-200 px-4 py-3 shadow-md border-b border-neutral-800">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                {/* Logo + Admin Link */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                    <Link to="/dashboard" className="text-xl font-semibold hover:text-neutral-400 flex items-center space-x-2">
                        <img src="/logo_echolog.png" alt="EchoLog Logo" className="w-6 h-6" />
                        <span>EchoLog</span>
                    </Link>

                    {isAdmin && (
                        <Link to="/admin" className="text-blue-400 hover:text-blue-500 text-sm sm:text-base font-medium">
                            Admin Panel
                        </Link>
                    )}
                </div>

                {/* Username + Logout */}
                <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <span className="text-neutral-300 text-sm sm:text-base">Welcome, {username}</span>
                    <button
                        onClick={handleLogout}
                        className="btnRedBig"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>



    );
};

const Layout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        const expires = localStorage.getItem('jwt_expires');

        if (!token || !expires || new Date(expires) < new Date()) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('jwt_expires');
            navigate('/login');
        }  
    }, [navigate]);

    return (
        <UserProvider>
            <div className="min-h-screen bg-neutral-800 text-neutral-200">
                <Topbar />
                <main className="p-6">
                    <Outlet />
                </main>
                <footer className="bg-neutral-900 text-neutral-400 text-center p-4 mt-8 text-sm">
                    EchoLog System © {new Date().getFullYear()}
                </footer>
            </div>
        </UserProvider>
    );
;
};

export default Layout;