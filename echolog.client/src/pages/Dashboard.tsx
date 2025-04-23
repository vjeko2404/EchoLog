import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Project, ProjectType, ProjectStatus } from '../types';
import { useUser } from '../components/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faTable } from '@fortawesome/free-solid-svg-icons';

const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
    const [statusId, setStatusId] = useState<number>(0); // Default to ID 1
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');

    const isMobile = window.innerWidth < 640;

    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [typeFilter, setTypeFilter] = useState<number | null>(null);
    const filteredProjects = typeFilter
        ? projects.filter(p => p.typeId === typeFilter)
        : projects;


    const [typeId, setTypeId] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const navigate = useNavigate();

    const { role } = useUser();

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 639px)');
        const handleResize = () => {
            if (mediaQuery.matches) {
                setViewMode('grid');
            }
        };
        handleResize(); // Initial check
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);


    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [pRes, tRes, sRes] = await Promise.all([
                    api.get<Project[]>('/projects'),
                    api.get<ProjectType[]>('/project-types'),
                    api.get<ProjectStatus[]>('/project-statuses')
                ]);
                setProjects(pRes.data);
                setProjectTypes(tRes.data);
                setProjectStatuses(sRes.data);
            } catch (err) {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const typeMap = useMemo(() => {
        return Object.fromEntries(projectTypes.map((t) => [t.id, t.value]));
    }, [projectTypes]);

    const statusMap = useMemo(() => {
        return Object.fromEntries(projectStatuses.map((s) => [s.id, s.value]));
    }, [projectStatuses]);

    const createProject = async () => {
        if (!title.trim()) return;

        const payload = {
            title,
            shortDescription,
            typeId
        };

        try {
            const response = await api.post('/projects', payload);
            navigate(`/project/${response.data.id}`);
        } catch (err: any) {
            console.error("❌ Failed to create project:", err.response?.data || err.message || err);
            setError('Failed to create project');
        }
    };

    const [sortField, setSortField] = useState<'title' | 'type' | 'status' | 'owner' | 'created' | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (!sortField) return 0;

        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (sortField) {
            case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case 'type':
                aValue = typeMap[a.typeId] ?? '';
                bValue = typeMap[b.typeId] ?? '';
                break;
            case 'status':
                aValue = statusMap[a.statusId] ?? '';
                bValue = statusMap[b.statusId] ?? '';
                break;
            case 'owner':
                aValue = a.ownerUsername ?? '';
                bValue = b.ownerUsername ?? '';
                break;
            case 'created':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });


    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-neutral-100">Dashboard</h1>
            </div>

            {/* Create Form */}
            {role !== 'Observer' && (
                <div className="bg-neutral-800 p-6 rounded-lg mb-6 shadow-xl border border-neutral-700">
                    <h2 className="text-lg text-neutral-100 font-semibold mb-4">Create New Project</h2>

                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="col-span-full md:col-span-2 px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                        />

                        <select
                            value={typeId}
                            onChange={(e) => setTypeId(Number(e.target.value))}
                            className="px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 w-full"
                        >
                            <option value={0}>-- Type --</option>
                            {projectTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.value}</option>
                            ))}
                        </select>

                        <select
                            value={statusId}
                            onChange={(e) => setStatusId(Number(e.target.value))}
                            className="px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 w-full"
                        >
                            <option value={0}>-- Status --</option>
                            {projectStatuses.map(s => (
                                <option key={s.id} value={s.id}>{s.value}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            placeholder="Short description"
                            className="col-span-full md:col-span-3 px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                        />

                        <button
                            onClick={() => {
                                if (typeId === 0 || statusId === 0) {
                                    setFormError('Please select both project type and status.');
                                    return;
                                }
                                createProject();
                                setFormError('');
                            }}
                            disabled={typeId === 0 || statusId === 0}
                            className={`btnGreenBig col-span-full sm:w-auto ${typeId === 0 || statusId === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Create
                        </button>
                    </div>


                    {formError && (
                        <p className="mt-3 text-sm text-red-400">{formError}</p>
                    )}
                </div>
            )}

            {/* Project View Filter + Toggle */}
            <div className="bg-neutral-800 p-6 rounded-lg mb-6 shadow-xl border border-neutral-700">
                <h2 className="text-lg text-neutral-100 font-semibold mb-4">Current Projects</h2>
                {!loading && projects.length > 0 && (
                    <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                        <select
                            value={typeFilter ?? ''}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setTypeFilter(isNaN(val) ? null : val);
                            }}
                            className="px-3 py-1 rounded bg-neutral-700 text-white border border-neutral-600"
                        >
                            <option value="">All Types</option>
                            {projectTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.value}</option>
                            ))}
                        </select>

                        <div className="flex gap-2 hidden sm:flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600/50' : 'bg-neutral-700'} hover:bg-blue-500/50 text-neutral-200`}
                            >
                                <FontAwesomeIcon icon={faTh} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-600/50' : 'bg-neutral-700'} hover:bg-blue-500/50 text-neutral-200`}
                            >
                                <FontAwesomeIcon icon={faTable} />
                            </button>
                        </div>

                    </div>
                )}

                {/* Project List */}
                {loading ? (
                    <div className="text-neutral-400">Loading...</div>
                ) : filteredProjects.length === 0 ? (
                    <p className="text-neutral-500 italic">No projects yet. Create one above.</p>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedProjects.map((p) => (

                            <Link
                                to={`/project/${p.id}`}
                                key={p.id}
                                className="relative bg-neutral-700 border border-neutral-700 p-5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                            >
                                <div
                                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-sm shadow-sm text-xs text-neutral-100 ${(() => {
                                        switch (p.statusId) {
                                            case 1: return 'bg-green-600/60';
                                            case 2: return 'bg-red-600/60';
                                            case 3: return 'bg-yellow-500/60';
                                            case 4: return 'bg-blue-500/60';
                                            case 5: return 'bg-neutral-500/60';
                                            default: return 'bg-neutral-700/50';
                                        }
                                    })()}`}
                                >
                                    {statusMap[p.statusId] || 'Unknown'}
                                </div>

                                <h3 className="text-lg font-bold text-white group-hover:text-blue-300">{p.title}</h3>
                                <p className="text-sm text-neutral-400 mt-1 truncate">{p.shortDescription || 'No description'}</p>

                                <div className="border-t border-neutral-700 mt-3 pt-3 text-xs text-neutral-400">
                                    <div>Type: {typeMap[p.typeId] || 'N/A'}</div>
                                    <div className="mt-1 text-neutral-500">Created: {new Date(p.createdAt).toLocaleDateString()}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm bg-neutral-700 border border-neutral-600 text-neutral-300 rounded overflow-hidden">
                            <thead className="bg-neutral-800 text-neutral-400">
                                <tr>
                                    <th onClick={() => handleSort('title')} className="text-left px-4 py-2 cursor-pointer hover:text-white">
                                        Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('type')} className="text-left px-4 py-2 cursor-pointer hover:text-white">
                                        Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('status')} className="text-left px-4 py-2 cursor-pointer hover:text-white">
                                        Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('owner')} className="text-left px-4 py-2 cursor-pointer hover:text-white">
                                        Owner {sortField === 'owner' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('created')} className="text-left px-4 py-2 cursor-pointer hover:text-white">
                                        Created {sortField === 'created' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {sortedProjects.map((p) => (
                                    <tr key={p.id} className="hover:bg-neutral-600">
                                        <td className="px-4 py-2">
                                            <Link to={`/project/${p.id}`} className="text-blue-400 hover:underline">{p.title}</Link>
                                        </td>
                                        <td className="px-4 py-2">{typeMap[p.typeId] || 'N/A'}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded text-xs text-white ${(() => {
                                                switch (p.statusId) {
                                                    case 1: return 'bg-green-600/60';
                                                    case 2: return 'bg-red-600/60';
                                                    case 3: return 'bg-yellow-500/60';
                                                    case 4: return 'bg-blue-500/60';
                                                    case 5: return 'bg-neutral-500/60';
                                                    default: return 'bg-neutral-700/50';
                                                }
                                            })()}`}>
                                                {statusMap[p.statusId] || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{p.ownerUsername || `User ID ${p.ownerId}`}</td>
                                        <td className="px-4 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
