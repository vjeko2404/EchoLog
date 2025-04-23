import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Project, ProjectDetail, ProjectNote, ProjectFile, ProjectStatus, ProjectType, ProjectUpdateDto, ProjectFileCategory } from '../types';
import { useUser } from '../components/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';


type Tab = 'summary' | 'detail' | 'notes' | 'files' | 'edit';

const ProjectDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = parseInt(id || '0', 10);
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [detail, setDetail] = useState<ProjectDetail | null>(null);
    const [notes, setNotes] = useState<ProjectNote[]>([]);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
    const [types, setTypes] = useState<ProjectType[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<ProjectFileCategory[]>([]);
    const [filterCategoryId, setFilterCategoryId] = useState(0);
    const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);

    const filteredFiles = useMemo(() => {
        return filterCategoryId === 0
            ? files
            : files.filter(file => file.categoryId === filterCategoryId);
    }, [files, filterCategoryId]);

    const { role, isAdmin } = useUser();

    // --- Fetching Categories ---
    useEffect(() => {
        api.get<ProjectFileCategory[]>('/file-categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error("Failed to fetch categories", err));
    }, []);


    // --- Fetching Data ---
    useEffect(() => {
        if (!projectId) {
            setError('Invalid project ID.');
            setLoading(false);
            return;
        }

        const fetchProjectData = async () => {
            setLoading(true);
            setError('');

            try {
                const [projectRes, statusRes, typeRes] = await Promise.all([
                    api.get<Project>(`/projects/${projectId}`),
                    api.get<ProjectStatus[]>('/project-statuses'),
                    api.get<ProjectType[]>('/project-types')
                ]);

                const project = projectRes.data;

                setProject(project);
                setDetail(project.detail || null);
                setNotes(project.notes || []);
                setFiles(project.files || []);
                setStatuses(statusRes.data);
                setTypes(typeRes.data);

            } catch (err: any) {
                console.error("Failed to fetch project data:", err);
                if (err.response?.status === 404 || err.response?.status === 403) {
                    setError('Project not found or access denied.');
                } else {
                    setError('Failed to load project data. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    // --- CRUD Handlers ---
    const handleAddNote = async (noteText: string) => {
        if (!noteText.trim() || !project) return;
        try {
            const response = await api.post<ProjectNote>('/project-notes', { projectId: project.id, noteText }); //
            setNotes([response.data, ...notes]);
        } catch (err) {
            console.error("Failed to add note:", err);
            alert("Error adding note.");
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        try {
            await api.delete(`/project-notes/${noteId}`); //
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (err) {
            console.error("Failed to delete note:", err);
            alert("Error deleting note.");
        }
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="text-center text-neutral-400 mt-10">Loading project details...</div>;
    }

    if (error || !project) {
        return <div className="text-center text-red-500 mt-10">{error || 'Project could not be loaded.'}</div>;
    }


    // --- Sub-Components for Tabs ---
    const SummaryTab: React.FC<{ project: Project }> = ({ project }) => (
        <div className="bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-700 space-y-4">
            <h2 className="text-xl font-semibold text-neutral-100 mb-4 border-b border-neutral-500 pb-2">Project Summary</h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-neutral-300">
                <div>
                    <dt className="font-medium text-neutral-400">Title</dt>
                    <dd className="text-neutral-100">{project.title}</dd>
                </div>

                <div>
                    <dt className="font-medium text-neutral-400">Type</dt>
                    <dd>{project.type || `ID ${project.typeId}`}</dd>
                </div>

                <div>
                    <dt className="font-medium text-neutral-400">Status</dt>
                    <dd>{project.status || `ID ${project.statusId}`}</dd>
                </div>

                <div>
                    <dt className="font-medium text-neutral-400">Owner</dt>
                    <dd>{project.ownerUsername || `User ID ${project.ownerId}`}</dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="font-medium text-neutral-400">Description</dt>
                    <dd>{project.shortDescription || 'N/A'}</dd>
                </div>

                <div>
                    <dt className="font-medium text-neutral-400">Created</dt>
                    <dd>{new Date(project.createdAt).toLocaleString()}</dd>
                </div>

                {project.updatedAt && (
                    <div>
                        <dt className="font-medium text-neutral-400">Updated</dt>
                        <dd>{new Date(project.updatedAt).toLocaleString()}</dd>
                    </div>
                )}
            </dl>
        </div>

    );

    const EditProjectTab: React.FC<{
        project: Project;
        statuses: ProjectStatus[];
        types: ProjectType[];
        onSave: (updated: ProjectUpdateDto) => void;
        onDelete: () => void;
        userRole: string;
    }> = ({ project, statuses, types, onSave, onDelete }) => {
        const [formData, setFormData] = useState<ProjectUpdateDto>({
            title: project.title,
            shortDescription: project.shortDescription || '',
            typeId: project.typeId,
            statusId: project.statusId
        });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: name === 'typeId' || name === 'statusId' ? parseInt(value) : value
            }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };


        return (
            <div className="bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-700 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-2xl font-semibold text-neutral-100 mb-4">Edit Project</h2>
                    <div>
                        <label htmlFor="title" className="block text-sm text-neutral-300">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full p-2 bg-neutral-700 border border-neutral-500 rounded text-neutral-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="shortDescription" className="block text-sm text-neutral-300">Short Description</label>
                        <textarea
                            id="shortDescription"
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            className="w-full p-2 bg-neutral-700 border border-neutral-500 rounded text-neutral-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="typeId" className="block text-sm text-neutral-300">Project Type</label>
                        <select
                            id="typeId"
                            name="typeId"
                            value={formData.typeId}
                            onChange={handleChange}
                            className="w-full p-2 bg-neutral-700 border border-neutral-500 rounded text-neutral-100"
                        >
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>{t.value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="statusId" className="block text-sm text-neutral-300">Project Status</label>
                        <select
                            id="statusId"
                            name="statusId"
                            value={formData.statusId}
                            onChange={handleChange}
                            className="w-full p-2 bg-neutral-700 border border-neutral-500 rounded text-neutral-100"
                        >
                            {statuses.map((s) => (
                                <option key={s.id} value={s.id}>{s.value}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex space-x-3 mt-4">
                        <button type="submit" className="btnGreen">
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="btnRed"
                        >
                            Delete Project
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const handleProjectUpdate = async (updated: ProjectUpdateDto) => {
        try {
            await api.put(`/projects/${project.id}`, updated);
            const refreshed = await api.get<Project>(`/projects/${project.id}`);
            setProject(refreshed.data);
            setActiveTab('summary');
        } catch (err) {
            console.error("Failed to update project:", err);
            alert("Could not save changes. Try again.");
        }
    };

    const handleProjectDelete = async () => {
        const input = window.prompt("To confirm deletion, type DELETE");
        if (!input || input.trim().toLowerCase() !== "delete") {
            alert("Deletion cancelled. You must type DELETE exactly.");
            return;
        }

        try {
            await api.delete(`/projects/${project.id}`);
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to delete project:", err);
            alert("Could not delete project. Please try again.");
        }
    };



    const DetailTab: React.FC<{ initialDetail: ProjectDetail | null, projectId: number, onUpdate: (data: Partial<ProjectDetail>) => void }> = ({ initialDetail, projectId, onUpdate }) => {
        const [isEditing, setIsEditing] = useState(!initialDetail); // Start editing if no details exist
        const [formData, setFormData] = useState<Partial<ProjectDetail>>(initialDetail || { projectId });

        useEffect(() => {
            // Update form if initialDetail changes (e.g., after initial fetch)
            setFormData(initialDetail || { projectId });
            setIsEditing(!initialDetail); // Reset editing state based on presence of details
        }, [initialDetail, projectId]);


        const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        };

        const handleSubmit = async (e: FormEvent) => {
            e.preventDefault();
            // Determine if creating or updating
            if (initialDetail) {
                // Updating existing details via PUT
                onUpdate(formData);
                setIsEditing(false); // Exit edit mode after saving
            } else {
                // Creating new details via POST
                try {
                    const response = await api.post<ProjectDetail>('/project-details', { ...formData, projectId });
                    onUpdate(response.data); // Pass created data back up
                    setIsEditing(false); // Exit edit mode
                } catch (err: any) {
                    console.error("Failed to create details:", err);
                    if (err.response && err.response.status === 409) {
                        alert("Error: Details already exist for this project. Try editing instead.");
                        // Optionally fetch existing details here
                    } else {
                        alert("Error creating project details.");
                    }
                }
            }
        };


        if (!isEditing && initialDetail) {
            return (
                <div className="bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-700 space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-600 pb-2">
                        <h2 className="text-xl font-semibold text-neutral-100">Details</h2>
                        {role !== 'Observer' && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btnBlue"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    <dl className="space-y-4 text-sm text-neutral-300">
                        <div>
                            <dt className="font-medium text-neutral-400 mb-1">Full Description</dt>
                            <dd className="whitespace-pre-wrap text-neutral-100">{initialDetail.fullDescription || 'N/A'}</dd>
                        </div>

                        <div>
                            <dt className="font-medium text-neutral-400 mb-1">Known Bugs</dt>
                            <dd className="whitespace-pre-wrap text-neutral-100">{initialDetail.knownBugs || 'N/A'}</dd>
                        </div>

                        <div>
                            <dt className="font-medium text-neutral-400 mb-1">Architecture Summary</dt>
                            <dd className="whitespace-pre-wrap text-neutral-100">{initialDetail.architectureSummary || 'N/A'}</dd>
                        </div>
                    </dl>
                </div>

            );
        }

        // Render Edit/Create Form
        return (
            role === 'Observer' ? (
                <div className="bg-neutral-700 border border-neutral-600 text-neutral-400 p-4 rounded italic">
                    No detailed project data available.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-2xl font-semibold text-neutral-100">{initialDetail ? 'Edit Details' : 'Add Details'}</h2>

                    <div>
                        <label htmlFor="fullDescription" className="block text-sm font-medium text-neutral-300 mb-1">Full Description</label>
                        <textarea
                            id="fullDescription" name="fullDescription" rows={4}
                            value={formData.fullDescription || ''} onChange={handleInputChange}
                            className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-neutral-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="knownBugs" className="block text-sm font-medium text-neutral-300 mb-1">Known Bugs</label>
                        <textarea
                            id="knownBugs" name="knownBugs" rows={3}
                            value={formData.knownBugs || ''} onChange={handleInputChange}
                            className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-neutral-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="architectureSummary" className="block text-sm font-medium text-neutral-300 mb-1">Architecture Summary</label>
                        <textarea
                            id="architectureSummary" name="architectureSummary" rows={3}
                            value={formData.architectureSummary || ''} onChange={handleInputChange}
                            className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-neutral-100"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button type="submit" className="btnGreen">Save Details</button>
                        {initialDetail && (
                            <button type="button" onClick={() => { setIsEditing(false); setFormData(initialDetail); }} className="btnGray">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )
        );

    };


    const NotesTab: React.FC<{ notes: ProjectNote[], onAdd: (text: string) => void, onDelete: (id: number) => void }> = ({ notes, onAdd, onDelete }) => {
        const [newNote, setNewNote] = useState('');

        const handleAddClick = () => {
            onAdd(newNote);
            setNewNote('');
        };

        return (
            <div className="bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-700 space-y-4">
                <h2 className="text-2xl font-semibold text-neutral-100 mb-4">Notes</h2>
                {role !== 'Observer' && (
                    <div className="mb-4 space-y-2">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                            placeholder="Add a new note..."
                            className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-neutral-100"
                        />
                        <button
                            onClick={handleAddClick}
                            disabled={!newNote.trim()}
                            className="btnGreen"
                        >
                            Add Note
                        </button>
                    </div>
                )}
                <div className="bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-700">
                    <ul className="space-y-3">
                        {notes.length > 0 ? notes.map(note => (
                            <li key={note.id} className="bg-neutral-600 p-3 rounded flex justify-between items-start">
                                <div>
                                    <p className="text-neutral-100 whitespace-pre-wrap">{note.noteText}</p>
                                    <p className="text-xs text-neutral-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                                </div>
                                {role !== 'Observer' && (
                                    <button
                                        onClick={() => onDelete(note.id)}
                                        className="btnRed"
                                    >
                                        Delete
                                    </button>
                                )}
                            </li>
                        )) : <p className="text-neutral-400">No notes yet.</p>}
                    </ul>
                </div>
            </div>
        );
    };

    const handleFileUpload = async (
        files: File[],
        description: string,
        categoryId: number
    ) => {
        if (!files.length || !project) return;

        const formData = new FormData();

        for (const file of files) {
            formData.append('files', file); // multiple entries with the same key
        }

        formData.append('projectId', project.id.toString());
        formData.append('description', description);
        formData.append('categoryId', categoryId.toString());

        try {
            const response = await api.post<ProjectFile[]>('/project-files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFiles(prev => [...response.data, ...prev]);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed. Check backend and try again.");
        }
    };

    const toggleFileSelection = (id: number) => {
        setSelectedFileIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedFileIds.length === filteredFiles.length) {
            setSelectedFileIds([]);
        } else {
            setSelectedFileIds(filteredFiles.map(file => file.id));
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await api.delete(`/project-files/${fileId}`); //
            setFiles(files.filter(f => f.id !== fileId));
        } catch (err) {
            console.error("Failed to delete file:", err);
            alert("Error deleting file.");
        }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedFileIds.length} selected files? This cannot be undone.`)) return;

        try {
            await Promise.all(
                selectedFileIds.map(id =>
                    api.delete(`/project-files/${id}`)
                )
            );
            setFiles(prev => prev.filter(f => !selectedFileIds.includes(f.id)));
            setSelectedFileIds([]); // clear selection
        } catch (err) {
            console.error("Failed to delete selected files:", err);
            alert("Error deleting one or more files.");
        }
    };

    const handleDownloadSelected = async () => {
        if (selectedFileIds.length === 0) return;

        try {
            const response = await api.post(
                '/project-files/download-zip',
                selectedFileIds,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'echolog-files.zip';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Could not download selected files.');
        }
    };

    const handleSingleDownload = async (fileId: number, fileName: string) => {
        try {
            const response = await api.get(`/project-files/download/${fileId}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('File could not be downloaded.');
        }
    };


    const FilesTab: React.FC<{
        files: ProjectFile[],
        onUpload: (file: File, description: string, categoryId: number) => void,
        onDelete: (id: number) => void
    }>
        = ({ files, onUpload, onDelete }) => {
            const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
            const [description, setDescription] = useState('');


            return (
                <div className="bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-700 space-y-4">
                    <h2 className="text-2xl font-semibold text-neutral-100 mb-4">Files</h2>
                    {/* File Upload Section */}
                    {role !== 'Observer' && (
                        <div className="mb-6 p-5 bg-neutral-700 rounded-lg border border-neutral-500 space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-200">Upload New File</h3>

                            <label className="block text-sm text-neutral-300">Select File</label>
                            <div
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (!selectedCategoryId) return alert("Please select a category first.");
                                    if (e.dataTransfer.files.length > 0) {
                                        setSelectedFiles(Array.from(e.dataTransfer.files));
                                    }
                                }}
                                onDragOver={(e) => {
                                    if (!selectedCategoryId) return;
                                    e.preventDefault();
                                }}
                                onDragEnter={() => {
                                    if (selectedCategoryId) setIsDragging(true);
                                }}
                                onDragLeave={() => {
                                    if (selectedCategoryId) setIsDragging(false);
                                }}
                                className={`w-full p-6 border-2 border-dashed rounded-md text-center transition-all duration-200 cursor-pointer
        ${isDragging ? 'border-blue-400 bg-neutral-600' : 'border-neutral-600 bg-neutral-800'}
        ${!selectedCategoryId ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-neutral-700'}`}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    disabled={!selectedCategoryId}
                                    onChange={(e) => {
                                        if (!selectedCategoryId) return alert("Please select a category first.");
                                        if (e.target.files) setSelectedFiles(Array.from(e.target.files));
                                    }}
                                    className="hidden"
                                />
                                <label htmlFor="file-input" className={`block space-y-2 ${!selectedCategoryId ? 'pointer-events-none' : ''}`}>
                                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl text-blue-400" />
                                    <p className="text-sm text-neutral-300">
                                        {selectedCategoryId
                                            ? <>Drag & drop files here, or <span className="text-blue-400 underline">click to browse</span></>
                                            : <span className="italic text-neutral-500">Select a category before uploading</span>}
                                    </p>
                                </label>

                                {selectedFiles.length > 0 && (
                                    <ul className="mt-3 text-sm text-neutral-400">
                                        {selectedFiles.map(file => (
                                            <li key={file.name}>{file.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <label className="block mt-4 text-sm text-neutral-300">Category</label>
                            <select
                                value={selectedCategoryId ?? ''}
                                onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                                className="w-full bg-neutral-800/50 border border-neutral-600 text-neutral-100 p-2 rounded"
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <label className="block mt-4 text-sm text-neutral-300">File Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                placeholder="Optional description (applies to all)"
                                className="w-full p-2 bg-neutral-800/50 border border-neutral-600 rounded-md text-neutral-100"
                            />

                            <button
                                onClick={() => {
                                    if (selectedFiles && selectedCategoryId) {
                                        onUpload(selectedFiles, description, selectedCategoryId);
                                    }
                                }}
                                disabled={selectedFiles.length === 0}
                                className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-150 ${!selectedFiles
                                    ? 'bg-neutral-500 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                Upload
                            </button>
                        </div>
                    )}


                    {/* Filter Dropdown */}
                    <div className="mb-4 flex items-center justify-between">
                        <label className="text-sm text-neutral-300 mr-2">Filter by Category:</label>
                        <select
                            value={filterCategoryId}
                            onChange={(e) => setFilterCategoryId(Number(e.target.value))}
                            className="bg-neutral-700 text-neutral-100 border border-neutral-500 rounded px-3 py-1"
                        >
                            <option value={0}>All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedFileIds.length > 1 && (
                        <div className="mt-4 mb-4 flex justify-start space-x-3 animate-fade-in-slide">
                            <button
                                onClick={handleDownloadSelected}
                                className="btnBlue"
                            >
                                Download Selected ({selectedFileIds.length})
                            </button>

                            {role !== 'Observer' && (
                                <button
                                    onClick={handleDeleteSelected}
                                    className="btnRed"
                                >
                                    Delete Selected
                                </button>
                            )}
                        </div>
                    )}


                    {/* File Table */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm text-left text-neutral-300 border border-neutral-500">
                            <thead className="bg-neutral-800 border-b border-neutral-600">
                                <tr>
                                    <th className="px-2 py-2">
                                        <input
                                            type="checkbox"
                                            checked={filteredFiles.length > 0 && filteredFiles.every(f => selectedFileIds.includes(f.id))}
                                            onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                setSelectedFileIds(isChecked ? filteredFiles.map(f => f.id) : []);
                                            }}
                                            className="mr-2"
                                        />
                                    </th>
                                    <th className="px-4 py-2">File Name</th>
                                    <th className="px-4 py-2">Category</th>
                                    <th className="px-4 py-2">Uploaded</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredFiles.length > 0 ? filteredFiles.map(file => (
                                    <tr key={file.id} className="border-b border-neutral-600 hover:bg-neutral-700">
                                        <td className="px-2 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedFileIds.includes(file.id)}
                                                onChange={() => toggleFileSelection(file.id)}
                                            />

                                        </td>
                                        <td className="px-4 py-2 relative group">
                                            <button
                                                onClick={() => handleSingleDownload(file.id, file.fileName)}
                                                className="text-blue-400 hover:underline"
                                            >
                                                {file.fileName}
                                            </button>
                                            {file.description && (
                                                <div className="absolute z-10 hidden group-hover:block bg-neutral-900 text-neutral-200 text-xs rounded p-3 shadow-2xl w-64 top-1/2 -translate-y-1/2 left-[8rem] ml-4 
        opacity-0 translate-x-2 transition-all duration-500 delay-1000 
        group-hover:opacity-100 group-hover:translate-x-0">
                                                    <p className="line-clamp-3 leading-relaxed">{file.description}</p>
                                                </div>
                                            )}


                                        </td>

                                        <td className="px-4 py-2">{file.categoryName || 'Uncategorized'}</td>
                                        <td className="px-4 py-2">{new Date(file.uploadedAt).toLocaleString()}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => onDelete(file.id)}
                                                className="btnRed"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="text-center text-neutral-400 py-4">No files found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="space-y-4 sm:hidden">
                        {filteredFiles.length > 0 ? filteredFiles.map(file => (
                            <div key={file.id} className="bg-neutral-700 border border-neutral-600 rounded-lg p-4 shadow-sm relative">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-blue-400 break-words">{file.fileName}</h3>
                                    <input
                                        type="checkbox"
                                        checked={selectedFileIds.includes(file.id)}
                                        onChange={() => toggleFileSelection(file.id)}
                                        className="ml-2"
                                    />
                                </div>

                                {file.description && (
                                    <p className="text-xs text-neutral-400 mt-2 whitespace-pre-line">{file.description}</p>
                                )}

                                <div className="text-xs text-neutral-400 mt-2">
                                    <div>Category: <span className="text-neutral-300">{file.categoryName || 'Uncategorized'}</span></div>
                                    <div>Uploaded: <span className="text-neutral-300">{new Date(file.uploadedAt).toLocaleString()}</span></div>
                                </div>

                                <div className="mt-3 flex justify-between items-center">
                                    <button
                                        onClick={() => handleSingleDownload(file.id, file.fileName)}
                                        className="text-blue-400 text-sm hover:underline"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => onDelete(file.id)}
                                        className="btnRed text-xs"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-neutral-400 italic text-sm text-center">No files found.</p>
                        )}
                    </div>

                </div>
            );
        };


    // --- Main Render ---
    return (
        <div className="container mx-auto">
            <button onClick={() => navigate('/dashboard')} className="text-blue-400 hover:underline mb-4">&larr; Back to Dashboard</button>
            <h1 className="text-3xl font-semibold text-neutral-100 mb-6">{project.title}</h1>

            {/* Tabs Navigation */}
            <div className="border-b border-neutral-600 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {(['summary', ...(role !== 'Observer' ? ['edit'] : []), 'detail', 'notes', 'files'] as Tab[]).map((tabName) => (
                        <button
                            key={tabName}
                            onClick={() => setActiveTab(tabName)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tabName
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-500'
                                }`}
                        >
                            {tabName}
                        </button>
                    ))}
                </nav>

            </div>

            {/* Tab Content */}
            <div className="bg-neutral-700 p-6 rounded-lg shadow">
                {activeTab === 'summary' && <SummaryTab project={project} />}
                {activeTab === 'edit' && project && (
                    <EditProjectTab
                        project={project}
                        statuses={statuses}
                        types={types}
                        onSave={handleProjectUpdate}
                        onDelete={handleProjectDelete}
                        userRole={role}
                    />
                )}

                {activeTab === 'detail' && <DetailTab initialDetail={detail} projectId={projectId} onUpdate={setDetail} />}
                {activeTab === 'notes' && <NotesTab notes={notes} onAdd={handleAddNote} onDelete={handleDeleteNote} />}
                {activeTab === 'files' && <FilesTab files={files} onUpload={handleFileUpload} onDelete={handleDeleteFile} />}

            </div>
        </div>
    );
};

export default ProjectDetailPage;