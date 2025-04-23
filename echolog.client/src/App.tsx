import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages and Components
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminPanel from './pages/AdminPanel'; 
import Layout from './components/Layout'; 

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="project/:id" element={<ProjectDetailPage />} />
                    <Route path="admin" element={<AdminPanel />} />           
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} /> {/* Or a 404 page */}

            </Routes>
        </BrowserRouter>
    );
}

export default App;
