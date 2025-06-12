// taskpay-frontend/src/pages/ClientDashboard.jsx (UPDATED for backend integration, correctly formatted)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientDashboard.css';
import { formatName } from '../utils/formatName.js';
import ApplicantsModal from '../components/ClientDashboard/ApplicantsModal.jsx'; // Make sure this path is correct
import axios from 'axios'; // Import axios

const API_BASE_URL = 'http://localhost:3001/api'; // Your backend API base URL

const EditTaskModal = ({ task, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        // Pre-fill form with existing task data
        Title: task.jobTitle,
        Description: task.description,
        Budget: task.budget,
        Location: task.location,
        Deadline: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(task.id, formData); // Pass the updated data to the handler
    };

    return (
        <div className="modal-overlay">
            <div className="edit-modal-content">
                <h2>Edit Task</h2>
                <form onSubmit={handleSubmit}>
                    {/* Job Title remains on its own line */}
                    <div className="form-group">
                        <label htmlFor="Title">Job Title</label>
                        <input id="Title" type="text" value={formData.Title} onChange={handleChange} required />
                    </div>

                    {/* NEW: A wrapper div for the horizontal row */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="Budget">Budget</label>
                            <input id="Budget" type="number" value={formData.Budget} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="Deadline">Deadline</label>
                            <input id="Deadline" type="date" value={formData.Deadline} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="Location">Location</label>
                            <input id="Location" type="text" value={formData.Location} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Description remains on its own line */}
                    <div className="form-group">
                        <label htmlFor="Description">Description</label>
                        <textarea id="Description" value={formData.Description} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-actions">
                        <button type="submit" className="update-task-button">Update Task</button>
                        <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function ClientDashboard() {
    // --- State Management ---
    const [clientProfile, setClientProfile] = useState(null);
    const [allTasks, setAllTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [stats, setStats] = useState({ filledTasks: 0, openTasks: 0, totalApplications: 0, completedTasks: 0 });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // State for Create New Task Form
    const [jobTitle, setJobTitle] = useState('');
    const [category, setCategory] = useState('');
    const [budget, setBudget] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [location, setLocation] = useState('');

    // State for filtering tasks
    const [taskFilter, setTaskFilter] = useState('All Tasks');

    // State for pagination
    const [currentTasksPage, setCurrentTasksPage] = useState(1);
    const [currentCompletedTasksPage, setCurrentCompletedTasksPage] = useState(1);
    const tasksPerPage = 3;
    const completedTasksPerPage = 2;

    // --- Modal State for Applicants ---
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [selectedTaskForApplicants, setSelectedTaskForApplicants] = useState(null);

    // Modal for editing tasks
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);

    // Helper function for header initials
    const getInitials = useCallback((name = '') => {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (name) {
            return name.substring(0, 2).toUpperCase();
        }
        return 'US'; // Default initials
    }, []);

    // Function to re-fetch all dashboard data. Extracted for reusability.
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const authToken = sessionStorage.getItem('authToken');
        if (!authToken) {
            setError('Authentication required. Please log in.');
            setIsLoading(false);
            navigate('/login');
            return;
        }

        const api = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        try {
            // Fetch all dashboard data concurrently
            const [summaryRes, tasksRes, completedTasksRes] = await Promise.allSettled([
                api.get('/client/dashboard-summary'),
                api.get(`/client/tasks?page=${currentTasksPage}&limit=${tasksPerPage}&status=${taskFilter}`),
                api.get(`/client/completed-tasks?page=${currentCompletedTasksPage}&limit=${completedTasksPerPage}`)
            ]);

            // Process dashboard summary
            if (summaryRes.status === 'fulfilled' && summaryRes.value.data.success) {
                setClientProfile(summaryRes.value.data.clientProfile);
                setStats(summaryRes.value.data.stats);
            } else {
                console.error('Failed to fetch summary:', summaryRes.reason || summaryRes.value.data.message);
                setError('Failed to load dashboard summary.');
            }

            // Process client tasks
            if (tasksRes.status === 'fulfilled' && tasksRes.value.data.success) {
                setAllTasks(tasksRes.value.data.tasks || []);
            } else {
                console.error('Failed to fetch tasks:', tasksRes.value?.data?.message || tasksRes.reason);
                setError('Failed to load your tasks.');
            }

            // Process completed tasks
            if (completedTasksRes.status === 'fulfilled' && completedTasksRes.value.data.success) {
                setCompletedTasks(completedTasksRes.value.data.completedTasks || []);
            } else {
                console.error('Failed to fetch completed tasks:', completedTasksRes.value?.data?.message || completedTasksRes.reason);
                setError('Failed to load completed tasks.');
            }

        } catch (err) {
            console.error('Dashboard data fetching error:', err);
            setError('An unexpected error occurred while loading dashboard data.');
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate, currentTasksPage, currentCompletedTasksPage, taskFilter]); // Dependencies for fetchDashboardData

    // --- useEffect for initial data load and re-fetching on dependencies ---
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]); // fetchDashboardData is a dependency because it's wrapped in useCallback

    const filteredTasks = useMemo(() => {
        return allTasks;
    }, [allTasks]);

    const indexOfLastTask = currentTasksPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    // --- FIX START: Add this line for currentTasks ---
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
    // --- FIX END ---
    const totalTasksPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const paginateTasks = (pageNumber) => setCurrentTasksPage(pageNumber);

    const indexOfLastCompletedTask = currentCompletedTasksPage * completedTasksPerPage;
    const indexOfFirstCompletedTask = indexOfLastCompletedTask - completedTasksPerPage;
    // --- FIX START: Add this line for currentCompletedTasks ---
    const currentCompletedTasks = completedTasks.slice(indexOfFirstCompletedTask, indexOfLastCompletedTask);
    // --- FIX END ---
    const totalCompletedTasksPages = Math.ceil(completedTasks.length / completedTasksPerPage); // Note: It was `completedCompletedTasksPerPage` in previous versions. Ensure it's `completedTasksPerPage`
    const paginateCompletedTasks = (pageNumber) => setCurrentCompletedTasksPage(pageNumber);


    // --- Task Action Handlers (Calling Backend APIs and then refreshing data) ---

    const handleViewApplicants = useCallback((task) => {
        setSelectedTaskForApplicants(task);
        setShowApplicantsModal(true);
    }, []);

    const handleHireApplicant = useCallback(async (taskId, applicantId, applicantName) => {
        // --- ADD THIS LOG ---
        console.log("handleHireApplicant triggered!");
        console.log("Attempting to hire:", { taskId, applicantId, applicantName });
        // --- END LOG ---

        const authToken = sessionStorage.getItem('authToken');
        if (!authToken) {
            alert('Authentication required.');
            navigate('/login');
            // --- ADD THIS LOG ---
            console.log("No authToken, redirecting.");
            // --- END LOG ---
            return;
        }

        const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Authorization': `Bearer ${authToken}` } });

        try {
            // --- ADD THIS LOG (just before the API call) ---
            console.log("Making API call to hire applicant...");
            // --- END LOG ---
            const response = await api.put(`/client/tasks/${taskId}/hire`, { applicantId });
            // --- ADD THIS LOG ---
            console.log("Hire API call successful:", response.data);
            // --- END LOG ---
            alert(response.data.message);
            fetchDashboardData();
            setShowApplicantsModal(false);
        } catch (error) {
            // --- ADD THIS LOG ---
            console.error('Hire API call failed. Error object:', error);
            // --- END LOG ---
            alert(`Failed to hire applicant: ${error.response?.data?.message || 'Please try again.'}`);
        }
    }, [navigate, fetchDashboardData]);

    const handleMarkAsFilled = useCallback(async (taskId) => {
        const authToken = sessionStorage.getItem('authToken');
        if (!authToken) { alert('Authentication required.'); navigate('/login'); return; }
        const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Authorization': `Bearer ${authToken}` } });

        try {
            const response = await api.put(`/client/tasks/${taskId}/mark-filled`);
            alert(response.data.message);
            fetchDashboardData(); // Refresh all data
        } catch (error) {
            console.error('Error marking task as filled:', error.response ? error.response.data : error.message);
            alert(`Failed to mark task as filled: ${error.response?.data?.message || 'Please try again.'}`);
        }
    }, [navigate, fetchDashboardData]);

    const handleReopenJob = useCallback(async (taskId) => {
        const authToken = sessionStorage.getItem('authToken');
        if (!authToken) { alert('Authentication required.'); navigate('/login'); return; }
        const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Authorization': `Bearer ${authToken}` } });

        try {
            const response = await api.put(`/client/tasks/${taskId}/reopen`);
            alert(response.data.message);
            fetchDashboardData(); // Refresh all data
        } catch (error) {
            console.error('Error reopening job:', error.response ? error.response.data : error.message);
            alert(`Failed to reopen job: ${error.response?.data?.message || 'Please try again.'}`);
        }
    }, [navigate, fetchDashboardData]);

    

    const handleDeleteJob = useCallback(async (taskId, jobTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) { return; }
        const authToken = sessionStorage.getItem('authToken');
        if (!authToken) { alert('Authentication required.'); navigate('/login'); return; }
        const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Authorization': `Bearer ${authToken}` } });

        try {
            const response = await api.delete(`/client/tasks/${taskId}`);
            alert(response.data.message);
            fetchDashboardData(); // Refresh all data
        } catch (error) {
            console.error('Error deleting job:', error.response ? error.response.data : error.message);
            alert(`Failed to delete job: ${error.response?.data?.message || 'Please try again.'}`);
        }
    }, [navigate, fetchDashboardData]);

    const handleOpenEditModal = (task) => {
        setTaskToEdit(task);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setTaskToEdit(null);
        setIsEditModalOpen(false);
    };

    const handleUpdateTask = async (taskId, updatedData) => {
        const authToken = sessionStorage.getItem('authToken');
        const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Authorization': `Bearer ${authToken}` } });
        try {
            await api.put(`/tasks/${taskId}`, updatedData);
            alert('Task updated successfully!');
            handleCloseEditModal();
            fetchDashboardData(); // Refresh data to show changes
        } catch (error) {
            alert(`Failed to update task: ${error.response?.data?.message || 'Please try again.'}`);
        }
    };

    const handlePostTask = useCallback(async (e) => {
        e.preventDefault();

        const newTaskPayload = { // Data to send to backend
            jobTitle,
            category,
            budget: parseInt(budget),
            description,
            deadline,
            location,
        };

        const authToken = sessionStorage.getItem('authToken');
        if (!authToken) { alert('Authentication required.'); navigate('/login'); return; }
        const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Authorization': `Bearer ${authToken}` } });

        try {
            const response = await api.post('/client/tasks', newTaskPayload);
            alert('Task Posted successfully!');
            fetchDashboardData(); // Refresh all data
        } catch (error) {
            console.error('Error posting task:', error.response ? error.response.data : error.message);
            alert(`Failed to post task: ${error.response?.data?.message || 'Please try again.'}`);
        }

        // Reset form fields
        setJobTitle(''); setCategory(''); setBudget(''); setDescription(''); setDeadline(''); setLocation('');
    }, [jobTitle, category, budget, description, deadline, location, navigate, fetchDashboardData]);

    const handleViewApplicantInfo = useCallback((applicantId) => {
        navigate(`/client/applicant-info/${applicantId}`);
    }, [navigate]);

    if (isLoading) {
        return <div className="loading-state">Loading dashboard data...</div>;
    }

    if (error) {
        return <div className="error-state">Error: {error}. Please try again or refresh.</div>;
    }

    return (
        <div className="client-dashboard-container flex flex-column">
            <div className="client-dashboard-header flex items-center">
                <h1 className="client-taskpay-title text-[32px] tracking-[3px] font-bold">Task<span>Pay</span></h1>
                <div className="client-dashboard-name-img-container flex flex-row leading-[15px]">
                    <div>
                        <p className="tracking-[3px] font-bold text-18px">
                            Welcome, {clientProfile?.First_Name ? formatName(clientProfile.First_Name) : 'User'}{' '}
                            {clientProfile?.Surname ? formatName(clientProfile.Surname) : ''}
                        </p>
                        <p className="client-dashboard-text tracking-[3px] text-16px font-bold">Client Dashboard</p>
                    </div>
                    <div className="client-profile-initials">
                        {getInitials(`${clientProfile?.First_Name || ''} ${clientProfile?.Surname || ''}`)}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="client-dashboard-stats-container flex flex-row">
                <div className="filled-task-container stat-card">
                    <p className="stat-value">{stats.filledTasks}</p>
                    <p className="stat-label">Filled Tasks</p>
                </div>
                <div className="open-tasks-container stat-card">
                    <p className="stat-value">{stats.openTasks}</p>
                    <p className="stat-label">Open Tasks</p>
                </div>
                <div className="total-applications-container stat-card">
                    <p className="stat-value">{stats.totalApplications}</p>
                    <p className="stat-label">Total Applications</p>
                </div>
                <div className="completed-tasks-container stat-card">
                    <p className="stat-value">{stats.completedTasks}</p>
                    <p className="stat-label">Completed Tasks</p>
                </div>
            </div>

            {/* Task Listings and Forms/Completed Tasks */}
            <div className="client-dashboard-bottom-container flex flex-row">
                {/* Your Task Listings */}
                <div className="task-listings-container">
                    <div className="task-listings-header">
                        <h2>Your Task Listings</h2>
                        <div className="task-filter">
                            <select value={taskFilter} onChange={(e) => {
                                setTaskFilter(e.target.value);
                                setCurrentTasksPage(1); // Reset to first page on filter change
                            }}>
                                <option value="All Tasks">All Tasks</option>
                                <option value="Open Tasks">Open Tasks</option>
                                <option value="Filled Tasks">Filled Tasks</option>
                                <option value="Closed Tasks">Closed Tasks</option>
                            </select>
                        </div>
                    </div>
                    <div className="task-list">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => ( // Use filteredTasks here
                                <div key={task.id} className={`task-card ${task.status === 'filled' ? 'filled-task' : task.status === 'closed' ? 'closed-task' : 'open-task'}`}>
                                    <h3>{task.jobTitle}</h3> {/* H3 now only contains the job title */}
                                    {/* NEW: Status badge moved outside H3 and given a specific class for positioning */}
                                    {task.status === 'closed' && <span className="status-badge closed task-card-status">Closed</span>}
                                    {task.status === 'filled' && <span className="status-badge filled task-card-status">Filled</span>}
                                    {task.status === 'open' && <span className="status-badge open task-card-status">Active</span>}
                                    <div className="task-meta">
                                        <span>{task.location}</span> | <span>${task.budget}</span> | <span>Due: {task.dueDate}</span>
                                        {/* applicants will be an array, check its length */}
                                        {task.applicants && <span> | {task.applicants.length} Applicants</span>}
                                        {task.filledDate && <span> | Filled: {task.filledDate}</span>}
                                    </div>
                                    <p className="task-description">{task.description}</p>
                                    {task.selectedApplicantName && (
                                        <div className="selected-applicant">
                                            Selected Applicant: <span>{task.selectedApplicantName}</span>
                                        </div>
                                    )}
                                    <div className="task-actions">
                                        {/* View Applicants button: show if there are ANY applications (even historical) */}
                                        {/* Count reflects active/pending applications for clarity */}
                                        {task.applicants && task.applicants.length > 0 && ( // Button appears if there are any applications (active or historical)
                                            <button
                                                className="view-applicants-button"
                                                onClick={() => handleViewApplicants(task)}
                                            >
                                            View Applicants
                                            </button>
                                        )}

                                        {/* Dynamic buttons based on status */}
                                        {(task.status === 'filled' || task.status === 'closed') && (
                                            <button className="reopen-job-button" onClick={() => handleReopenJob(task.id)}>Reopen Job</button>
                                        )}
                                        {task.status === 'open' && (
                                            <>
                                                <button className="edit-button" onClick={() => handleOpenEditModal(task)}>Edit</button>
                                                <button className="mark-as-filled-button" onClick={() => handleMarkAsFilled(task.id)}>Mark as Filled</button>
                                            </>
                                        )}
                                        <button className="delete-button" onClick={() => handleDeleteJob(task.id, task.jobTitle)}>Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-tasks">No tasks to display based on the current filter.</p>
                        )}
                    </div>
                    <div className="pagination">
                        <button onClick={() => paginateTasks(currentTasksPage - 1)} disabled={currentTasksPage === 1}>Previous</button>
                        {[...Array(totalTasksPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginateTasks(index + 1)}
                                className={currentTasksPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button onClick={() => paginateTasks(currentTasksPage + 1)} disabled={currentTasksPage === totalTasksPages}>Next</button>
                    </div>
                </div>

                {/* Create New Task and Completed Tasks forms */}
                <div className="post-and-completed-tasks-container">
                    <div className="post-new-job-container">
                        <h2>Create New Task</h2>
                        <form onSubmit={handlePostTask}>
                            <div className="form-group">
                                <label htmlFor="jobTitle">Job Title</label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="Job Title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Web Design">Web Design</option>
                                    <option value="Logo Design">Logo Design</option>
                                    <option value="Content Writing">Content Writing</option>
                                    <option value="Mobile App Development">Mobile App Development</option>
                                    <option value="Social Media">Social Media</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="budget">Budget</label>
                                <input
                                    type="number"
                                    id="budget"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    placeholder="Budget"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the task requirements..."
                                    required
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="deadline">Deadline</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City or Region"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="post-task-button">Post Task</button>
                                <button type="button" className="cancel-button" onClick={() => {
                                    setJobTitle(''); setCategory(''); setBudget(''); setDescription(''); setDeadline(''); setLocation('');
                                }}>Cancel</button>
                            </div>
                        </form>
                    </div>

                    <div className="completed-tasks-bottom-container">
                        <h2>Completed Tasks</h2>
                        <div className="completed-tasks-list">
                            {currentCompletedTasks.length > 0 ? (
                                currentCompletedTasks.map(task => (
                                    <div key={task.id} className="completed-task-card">
                                        <h3>{task.jobTitle} <span className="status-badge filled">Filled</span></h3>
                                        <p className="completed-task-meta">
                                            <span>{task.location}</span> | <span>${task.budget}</span> | <span>Duration: {task.duration}</span>
                                        </p>
                                        <p className="completed-by">Completed by: <span>{task.completedBy}</span></p>
                                    </div>
                                ))
                            ) : (
                                <p className="no-tasks">No completed tasks to display.</p>
                            )}
                        </div>
                        <div className="pagination">
                            <button onClick={() => paginateCompletedTasks(currentCompletedTasksPage - 1)} disabled={currentCompletedTasksPage === 1}>Previous</button>
                            {[...Array(totalCompletedTasksPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => paginateCompletedTasks(index + 1)}
                                    className={currentCompletedTasksPage === index + 1 ? 'active' : ''}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button onClick={() => paginateCompletedTasks(currentCompletedTasksPage + 1)} disabled={currentCompletedTasksPage === totalCompletedTasksPages}>Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applicants Modal - conditionally rendered */}
            {showApplicantsModal && selectedTaskForApplicants && (
                <ApplicantsModal
                    task={selectedTaskForApplicants}
                    onClose={() => setShowApplicantsModal(false)}
                    onHire={handleHireApplicant}
                    onViewApplicantInfo={handleViewApplicantInfo}
                />
            )}
            {/* Edit Task Modal - conditionally rendered */}
            {isEditModalOpen && taskToEdit && (
                <EditTaskModal
                    task={taskToEdit}
                    onClose={handleCloseEditModal}
                    onUpdate={handleUpdateTask}
                />
            )}
        </div>
    );
}

export default ClientDashboard;