import React, { useState, useEffect, FormEvent } from 'react';
import api from '../api';
import { User, UserRole, ProjectFileCategory, AppSetting, Project, CollapsibleSectionProps } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);

    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);

    const [error, setError] = useState<string>('');

    const [settingErrors, setSettingErrors] = useState<string>('')

    // --- Category State ---
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editedCategoryNames, setEditedCategoryNames] = useState<Record<number, string>>({});

    // --- State for Forms ---
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState<number | string>('');

    // --- Settings ---
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get<AppSetting[]>('/app-settings');
                setSettings(response.data);
            } catch (err) {
                console.error("Failed to load settings:", err);
                setSettingErrors("Could not load application settings.");
            } finally {
                setLoadingSettings(false);
            }
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get<Project[]>('/projects');
                setProjects(res.data);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            }
        };
        fetchProjects();
    }, []);


    const handleSave = async (key: string, value: string) => {
        try {
            await api.put(`/app-settings/${key}`, { value });
            console.log(`Setting '${key}' updated successfully.`);
        } catch (err) {
            console.error(`Failed to update setting '${key}':`, err);
            alert(`Update failed for setting "${key}".`);
        }
    };

    const updateSettingValueByKey = (key: string, newValue: string) => {
        setSettings(prev =>
            prev.map(setting =>
                setting.key === key
                    ? { ...setting, value: newValue }
                    : setting
            )
        );
    };

    const handleSettingsSave = async (e: React.FormEvent) => {
        e.preventDefault();
        for (const s of settings) {
            await api.put(`/settings/${s.id}`, s);
        }
        alert("Settings saved.");
    };

    // --- Fetching Data ---
    useEffect(() => {
        const fetchAdminData = async () => {
            setLoadingUsers(true);
            setLoadingRoles(true);
            setError('');
            try {
                // Fetch Users - GET /api/users
                const usersResponse = await api.get<User[]>('/users');
                setUsers(usersResponse.data);
                setLoadingUsers(false);

                // Fetch Roles - GET /api/users/roles
                const rolesResponse = await api.get<UserRole[]>('/users/roles');
                setRoles(rolesResponse.data);
                if (rolesResponse.data.length > 0) {
                    setSelectedRoleId(rolesResponse.data[0].id); // Default to first role
                }
                setLoadingRoles(false);

            } catch (err: any) {
                console.error("Failed to fetch admin data:", err);
                setError('Failed to load administrative data. Check permissions and API.');
                // Set all loading states to false on error
                setLoadingUsers(false);
                setLoadingRoles(false);
                // setLoadingSettings(false);
            }
        };
        fetchAdminData();
    }, []);

    // --- Fetching Categories ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/file-categories');
                setCategories(response.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    // --- User Management Handlers ---
    const handleAddUser = async (e: FormEvent) => {
        e.preventDefault();
        if (!newUsername || !newPassword || !selectedRoleId) {
            alert("Please fill in all fields for the new user.");
            return;
        }
        try {
            const newUser = { username: newUsername, password: newPassword, roleId: Number(selectedRoleId) };
            // POST /api/users
            const response = await api.post<User>('/users', newUser);
            setUsers([...users, response.data]); // Add new user to the list
            // Reset form
            setNewUsername('');
            setNewPassword('');
            if (roles.length > 0) setSelectedRoleId(roles[0].id);
            setShowAddUserForm(false);
            alert("User created successfully!");

        } catch (err: any) {
            console.error("Failed to add user:", err);
            if (err.response && err.response.status === 409) { // Conflict
                alert(`Error: Username '${newUsername}' already exists.`);
            } else if (err.response && err.response.status === 400) { // Bad Request
                alert(`Error: Invalid role selected or bad input.`);
            }
            else {
                alert("Error creating user. Please try again.");
            }
        }
    };

    const handleDeleteUser = async (userId: number, username: string) => {
        const confirmation = prompt(`Type DELETE to confirm deletion of user '${username}' (ID: ${userId}). This action is irreversible.`);
        if (confirmation !== 'DELETE') {
            alert("Deletion cancelled. Input was incorrect.");
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
            alert(`User '${username}' deleted successfully.`);
        } catch (err) {
            console.error("Failed to delete user:", err);
            alert(`Error deleting user '${username}'. Please try again.`);
        }
    };

    const handleAddCategory = async (e: FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const response = await api.post('/file-categories', { name: newCategoryName });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
        } catch (err) {
            console.error("Failed to add category", err);
            alert("Error creating category. Check if it already exists.");
        }
    };

    const handleCategoryInputChange = (id: number, value: string) => {
        setEditedCategoryNames(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleModifyCategory = async (id: number) => {
        const name = editedCategoryNames[id];
        if (!name || name.trim().length === 0) return;

        try {
            await api.put(`/file-categories/${id}`, { name });
            const updated = await api.get<ProjectFileCategory[]>('/file-categories');
            setCategories(updated.data);
            setEditedCategoryNames(prev => {
                const newMap = { ...prev };
                delete newMap[id];
                return newMap;
            });
        } catch (err) {
            console.error("Failed to update category:", err);
        }
    };

    const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);

        return (
            <section className="bg-neutral-700 px-4 py-3 rounded-lg shadow">
                <div
                    className="flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setIsOpen(prev => !prev)}
                >
                    <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>

                    <FontAwesomeIcon
                        icon={isOpen ? faChevronDown : faChevronRight}
                        className="text-neutral-300 transition-transform duration-200"
                    />
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px]' : 'max-h-0'} mt-4`}>
                    {isOpen && children}
                </div>
            </section>
        );
    };

    const handleDeleteCategory = async (id: number, name: string) => {
        if (!window.confirm(`Delete category "${name}"?`)) return;

        try {
            await api.delete(`/file-categories/${id}`);
            setCategories(categories.filter((cat) => cat.id !== id));
        } catch (err) {
            console.error("Failed to delete category", err);
            alert("Error deleting category.");
        }
    };

    // --- Render Logic ---
    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-3xl font-semibold text-neutral-100">Admin Panel</h1>
            {error && <p className="text-red-500 bg-red-900 border border-red-700 p-3 rounded">{error}</p>}

            {/* User Management Section */}

            <section className="bg-neutral-700 p-6 rounded-lg shadow">

                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setShowAddUserForm(!showAddUserForm)} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded">
                        {showAddUserForm ? 'Cancel Add User' : 'Add New User'}
                    </button>
                </div>

                {/* Add User Form (Conditional) */}
                {showAddUserForm && (
                    <form onSubmit={handleAddUser} className="mb-6 p-4 bg-neutral-600 rounded border border-neutral-500 space-y-3">
                        <h3 className="text-lg font-medium text-neutral-200">New User Details</h3>
                        <div>
                            <label htmlFor="newUsername" className="block text-sm text-neutral-300 mb-1">Username</label>
                            <input type="text" id="newUsername" value={newUsername} onChange={e => setNewUsername(e.target.value)} required className="w-full p-2 bg-neutral-500 border border-neutral-400 rounded text-neutral-100" />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm text-neutral-300 mb-1">Password</label>
                            <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-2 bg-neutral-500 border border-neutral-400 rounded text-neutral-100" />
                        </div>
                        <div>
                            <label htmlFor="roleId" className="block text-sm text-neutral-300 mb-1">Role</label>
                            <select id="roleId" value={selectedRoleId} onChange={e => setSelectedRoleId(Number(e.target.value))} required disabled={loadingRoles} className="w-full p-2 bg-neutral-500 border border-neutral-400 rounded text-neutral-100 disabled:opacity-50">
                                {loadingRoles ? (
                                    <option>Loading roles...</option>
                                ) : roles.length > 0 ? (
                                    roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)
                                ) : (
                                    <option>No roles found</option>
                                )}
                            </select>
                        </div>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">Create User</button>
                    </form>
                )}

                {/* User List Table */}
                {loadingUsers ? (
                    <p className="text-neutral-400">Loading users...</p>
                ) : users.length === 0 ? (
                    <p className="text-neutral-400">No users found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full bg-neutral-600 border border-neutral-500">
                                <thead className="bg-neutral-800 text-neutral-300">
                                    <tr>
                                        <th className="text-left py-2 px-4">ID</th>
                                        <th className="text-left py-2 px-4">Username</th>
                                        <th className="text-left py-2 px-4">Role</th>
                                        <th className="text-left py-2 px-4">Created At</th>
                                        <th className="text-left py-2 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-neutral-200">
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-neutral-500 hover:bg-neutral-500">
                                            <td className="py-2 px-4">{user.id}</td>
                                            <td className="py-2 px-4">{user.username}</td>
                                            <td className="py-2 px-4">{user.roleName || `Role ID: ${user.roleId}`}</td>
                                            <td className="py-2 px-4">{new Date(user.createdAt).toLocaleString()}</td>
                                            <td className="py-2 px-4 space-x-2">
                                                {/* <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button> */}
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    className="bg-red-700 hover:bg-red-800 text-white text-xs px-3 py-1 rounded shadow-sm transition"
                                                >
                                                    Delete
                                                </button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="space-y-4 sm:hidden">
                            {users.map(user => (
                                <div key={user.id} className="bg-neutral-800/50 border border-neutral-600 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-blue-400 break-words">{user.username}</h3>
                                        <span className="text-xs text-neutral-400">ID: {user.id}</span>
                                    </div>

                                    <div className="text-sm text-neutral-300 mt-2">
                                        <div>Role: <span className="text-neutral-100">{user.roleName || `Role ID: ${user.roleId}`}</span></div>
                                        <div className="text-xs text-neutral-400 mt-1">Created: {new Date(user.createdAt).toLocaleString()}</div>
                                    </div>

                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                            className="btnRed text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </section>

            {/* File Category Management Section */}
            <CollapsibleSection title="File Categories">
                <section className="bg-neutral-800/50 p-6 rounded-lg shadow">
                    <form onSubmit={handleAddCategory} className="flex space-x-4 mb-4">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name"
                            className="flex-grow bg-neutral-600 border border-neutral-500 text-neutral-100 p-2 rounded"
                        />
                        <button
                            type="submit"
                            className="btnGreen"
                        >
                            Add
                        </button>
                    </form>

                    <ul className="space-y-2">
                        {categories.map((cat) => (
                            <li key={cat.id} className="flex items-center space-x-2 bg-neutral-600 p-3 rounded">
                                <input
                                    type="text"
                                    value={editedCategoryNames[cat.id] ?? cat.name}
                                    onChange={(e) => handleCategoryInputChange(cat.id, e.target.value)}
                                    className="bg-neutral-500 border border-neutral-400 rounded px-2 py-1 text-white w-2/3"
                                />
                                <button
                                    onClick={() => handleModifyCategory(cat.id)}
                                    className="btnBlue"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                    className="btnRed"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            </CollapsibleSection>

            {/* Ownership */}
            <CollapsibleSection title="Project Ownership">
                <section className="bg-neutral-800/50 p-6 rounded-lg shadow">
                    {projects.length === 0 ? (
                        <p className="text-neutral-400">No projects found.</p>
                    ) : (
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full text-sm bg-neutral-600 border border-neutral-500 text-neutral-200">
                                <thead className="bg-neutral-800 text-neutral-300">
                                    <tr>
                                        <th className="py-2 px-4 text-left">Project</th>
                                        <th className="py-2 px-4 text-left">Current Owner</th>
                                        <th className="py-2 px-4 text-left">Change Owner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map(project => (
                                        <tr key={project.id} className="border-b border-neutral-500">
                                            <td className="py-2 px-4">{project.title}</td>
                                            <td className="py-2 px-4">{project.ownerUsername}</td>
                                            <td className="py-2 px-4">
                                                <select
                                                    value={project.ownerId}
                                                    onChange={async (e) => {
                                                        const newOwnerId = parseInt(e.target.value);
                                                        try {
                                                            await api.put(`/projects/${project.id}`, {
                                                                title: project.title,
                                                                shortDescription: project.shortDescription,
                                                                typeId: project.typeId,
                                                                statusId: project.statusId,
                                                                ownerId: newOwnerId, // <-- only sent by admin
                                                            });
                                                            const updated = await api.get<Project[]>('/projects');
                                                            setProjects(updated.data);
                                                        } catch (err) {
                                                            console.error("Failed to change project owner:", err);
                                                            alert("Failed to change owner.");
                                                        }
                                                    }}
                                                    className="bg-neutral-500 text-white p-1 rounded"
                                                >
                                                    {users.map(user => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.username}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
                <div className="space-y-4 sm:hidden">
                    {projects.map(project => (
                        <div key={project.id} className="bg-neutral-800/50 border border-neutral-600 rounded-lg p-4 shadow-sm">
                            <h3 className="text-sm font-semibold text-blue-300">{project.title}</h3>

                            <div className="text-sm text-neutral-300 mt-2">
                                <div>Current Owner: <span className="text-neutral-100">{project.ownerUsername}</span></div>
                            </div>

                            <div className="mt-3">
                                <label className="block text-xs text-neutral-400 mb-1">Change Owner</label>
                                <select
                                    value={project.ownerId}
                                    onChange={async (e) => {
                                        const newOwnerId = parseInt(e.target.value);
                                        try {
                                            await api.put(`/projects/${project.id}`, {
                                                title: project.title,
                                                shortDescription: project.shortDescription,
                                                typeId: project.typeId,
                                                statusId: project.statusId,
                                                ownerId: newOwnerId,
                                            });
                                            const updated = await api.get<Project[]>('/projects');
                                            setProjects(updated.data);
                                        } catch (err) {
                                            console.error("Failed to change project owner:", err);
                                            alert("Failed to change owner.");
                                        }
                                    }}
                                    className="w-full bg-neutral-600 border border-neutral-500 text-white p-2 rounded"
                                >
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

            </CollapsibleSection>

            {/* App Settings Section */}
            <CollapsibleSection title="App Settings">
                <div className="hidden sm:block">
                    <section className="bg-neutral-700 p-6 rounded-lg shadow">
                        {loadingSettings ? (
                            <p className="text-neutral-400">Loading settings...</p>
                        ) : (
                            <form className="space-y-4" onSubmit={handleSettingsSave}>
                                {settings.map((setting) => (
                                    <div key={setting.id} className="flex items-center space-x-4 bg-neutral-600 p-3 rounded">
                                        <label className="w-1/4 text-sm font-medium text-neutral-300">
                                            {setting.key}
                                        </label>
                                        <input
                                            type="text"
                                            value={setting.value}
                                            onChange={(e) => updateSettingValueByKey(setting.key, e.target.value)}
                                            className="flex-grow bg-neutral-500 border border-neutral-400 rounded px-2 py-1 text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSave(setting.key, setting.value)}
                                            className="btnGreen"
                                        >
                                            Save
                                        </button>
                                    </div>
                                ))}
                            </form>
                        )}
                    </section>
                </div>
                <div className="space-y-4 sm:hidden">
                    {loadingSettings ? (
                        <p className="text-neutral-400">Loading settings...</p>
                    ) : (
                        settings.map((setting) => (
                            <div key={setting.id} className="bg-neutral-800/50 border border-neutral-600 rounded-lg p-4 shadow-sm space-y-2">
                                <label className="block text-sm font-medium text-neutral-300">
                                    {setting.key}
                                </label>
                                <input
                                    type="text"
                                    value={setting.value}
                                    onChange={(e) => updateSettingValueByKey(setting.key, e.target.value)}
                                    className="w-full bg-neutral-600 border border-neutral-500 text-white p-2 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleSave(setting.key, setting.value)}
                                    className="btnGreen w-full"
                                >
                                    Save
                                </button>
                            </div>
                        ))
                    )}
                </div>

            </CollapsibleSection>
        </div>
    );
};

export default AdminPanel;