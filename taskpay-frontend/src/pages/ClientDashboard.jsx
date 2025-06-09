import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientDashboard.css';
import { formatName } from '../utils/formatName.js';

// --- Backend Integration Setup (uncomment and configure when ready) ---
import axios from 'axios'; // Import axios
const API_BASE_URL = 'http://localhost:3001/api'; // Your backend API base URL

function ClientDashboard() {
    // --- State Management ---
    // Initial states can be null/empty arrays to indicate data needs to be fetched
    const [clientProfile, setClientProfile] = useState(null);
    const [allTasks, setAllTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [stats, setStats] = useState({ filledTasks: 0, openTasks: 0, totalApplications: 0, completedTasks: 0 }); // completedTasks might be fetched separately or calculated

    const [isLoading, setIsLoading] = useState(true); // Added for initial data loading
    const [error, setError] = useState(null); // Added for initial data loading errors

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

    // --- Helper function for header initials ---
    const getInitials = useCallback((name = '') => {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (name) {
            return name.substring(0, 2).toUpperCase();
        }
        return 'US'; // Default initials
    }, []);

    // --- Data Fetching useEffect (for initial load of client profile, tasks, stats) ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);

            // Placeholder for authentication token
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                // If no token, redirect to login or show unauthorized message
                setError('Authentication required. Please log in.');
                setIsLoading(false);
                navigate('/login'); // Redirect to login
                return;
            }

            // Create an Axios instance with base URL and authorization header
            const api = axios.create({
                baseURL: API_BASE_URL,
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            try {
                // Use Promise.allSettled to fetch all data concurrently
                const results = await Promise.allSettled([
                    api.get('/client/profile'), // Example endpoint for client profile
                    api.get('/client/tasks'),   // Example endpoint for client's tasks
                    api.get('/client/completed-tasks'), // Example endpoint for client's completed tasks
                    api.get('/client/stats')    // Example endpoint for dashboard stats
                ]);

                // Process results (backend dev: ensure your API responses match these structures)
                if (results[0].status === 'fulfilled') {
                    setClientProfile(results[0].value.data);
                } else {
                    console.error('Failed to fetch client profile:', results[0].reason);
                    setError('Failed to load profile.');
                }

                if (results[1].status === 'fulfilled') {
                    setAllTasks(results[1].value.data.tasks || []); // Assuming tasks array is under .data.tasks
                } else {
                    console.error('Failed to fetch tasks:', results[1].reason);
                    setError('Failed to load tasks.');
                }

                if (results[2].status === 'fulfilled') {
                    setCompletedTasks(results[2].value.data.completedTasks || []); // Assuming completedTasks is under .data.completedTasks
                } else {
                    console.error('Failed to fetch completed tasks:', results[2].reason);
                    setError('Failed to load completed tasks.');
                }

                if (results[3].status === 'fulfilled') {
                    setStats(results[3].value.data);
                } else {
                    console.error('Failed to fetch stats:', results[3].reason);
                    setError('Failed to load dashboard stats.');
                }

            } catch (err) {
                console.error('Dashboard data fetching error:', err);
                setError('An unexpected error occurred while loading dashboard data.');
                // Handle specific error types, e.g., token expiry
                if (err.response && err.response.status === 401) {
                    navigate('/login'); // Redirect to login on unauthorized
                }
            } finally {
                setIsLoading(false);
            }
        };

        // --- Mock Data Initialization (for frontend development without backend) ---
        // Comment out fetchDashboardData() and uncomment this block
        // if you want to use static dummy data for frontend development.
        const initializeMockData = () => {
            setClientProfile({ First_Name: 'Juan', Surname: 'Dela Cruz', Email: 'juan.delacruz@example.com' });
            setAllTasks([
                { id: 1, jobTitle: 'Website Redesign Project', location: 'Manila', budget: 2500, dueDate: 'July 17, 2025',
                  applicants: [{ id: 101, name: 'Maria Cruz Santos', skills: ['Data Science', 'AI/ML', 'Web Development'] }],
                  filledDate: 'May 30, 2025', description: 'Experienced web dev for modern UI/UX.', status: 'filled',
                  selectedApplicantId: 101, selectedApplicantName: 'Maria Cruz Santos' },
                { id: 2, jobTitle: 'Logo Design for Startup', location: 'Manila', budget: 500, dueDate: 'July 17, 2025',
                  applicants: [{ id: 201, name: 'Benito Suarez', skills: ['Graphic Design', 'Branding'] }],
                  filledDate: null, description: 'Creative logo design.', status: 'open',
                  selectedApplicantId: null, selectedApplicantName: null },
                { id: 3, jobTitle: 'Content Writing for Blog', location: 'Manila', budget: 800, dueDate: 'July 17, 2025',
                  applicants: [{ id: 301, name: 'Diana Garcia', skills: ['Content Writing', 'SEO'] }],
                  filledDate: null, description: 'Content for blog.', status: 'open',
                  selectedApplicantId: null, selectedApplicantName: null },
                { id: 4, jobTitle: 'Mobile App Development', location: 'Cebu', budget: 5000, dueDate: 'August 1, 2025',
                  applicants: [], filledDate: null, description: 'Cross-platform mobile app.', status: 'open',
                  selectedApplicantId: null, selectedApplicantName: null },
                { id: 5, jobTitle: 'Social Media Manager', location: 'Remote', budget: 700, dueDate: 'July 25, 2025',
                  applicants: [{ id: 501, name: 'Emilio Lopez', skills: ['Social Media Marketing'] }], filledDate: null,
                  description: 'Handle online presence.', status: 'open', selectedApplicantId: null, selectedApplicantName: null },
                { id: 6, jobTitle: 'Data Entry Project', location: 'Manila', budget: 300, dueDate: 'July 10, 2025',
                  applicants: [], filledDate: null, description: 'Simple data entry.', status: 'closed',
                  selectedApplicantId: null, selectedApplicantName: null }
            ]);
            setCompletedTasks([
                { id: 101, jobTitle: 'Website Redesign Project', location: 'Manila', budget: 2500, duration: '7 days', completedBy: 'Maria Santos' },
                { id: 102, jobTitle: 'Mobile App Development', location: 'Manila', budget: 3400, duration: '7 days', completedBy: 'Maria Santos' },
                { id: 103, jobTitle: 'SEO Optimization', location: 'Davao', budget: 1200, duration: '5 days', completedBy: 'John Doe' }
            ]);
            // Stats will be calculated by the subsequent useEffect
            setIsLoading(false);
        };

        fetchDashboardData(); // Call the async data fetching function
        // OR
        // initializeMockData(); // Call the mock data initialization function
    }, [navigate]); // navigate is a dependency because it's used inside fetchDashboardData

    // --- Recalculate stats whenever allTasks changes (can be used with both real and mock data) ---
    useEffect(() => {
        const filled = allTasks.filter(task => task.status === 'filled').length;
        const open = allTasks.filter(task => task.status === 'open').length;
        const totalApps = allTasks.reduce((sum, task) => sum + (task.applicants ? task.applicants.length : 0), 0);
        // Note: completedTasks count is usually fetched from backend or a separate state if it's "total ever completed"
        // Here, we'll keep the design's 13 for demonstration, but a backend would provide the actual count.
        setStats(prevStats => ({
            ...prevStats,
            filledTasks: filled,
            openTasks: open,
            totalApplications: totalApps
        }));
    }, [allTasks]);


    // --- Task Filtering and Pagination Logic (remains the same) ---
    const filteredTasks = useMemo(() => {
        if (taskFilter === 'All Tasks') {
            return allTasks;
        } else if (taskFilter === 'Open Tasks') {
            return allTasks.filter(task => task.status === 'open');
        } else if (taskFilter === 'Filled Tasks') {
            return allTasks.filter(task => task.status === 'filled');
        } else if (taskFilter === 'Closed Tasks') {
            return allTasks.filter(task => task.status === 'closed');
        }
        return allTasks;
    }, [allTasks, taskFilter]);

    const indexOfLastTask = currentTasksPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalTasksPages = Math.ceil(filteredTasks.length / tasksPerPage);

    const paginateTasks = (pageNumber) => setCurrentTasksPage(pageNumber);

    const indexOfLastCompletedTask = currentCompletedTasksPage * completedTasksPerPage;
    const indexOfFirstCompletedTask = indexOfLastCompletedTask - completedTasksPerPage;
    const currentCompletedTasks = completedTasks.slice(indexOfFirstCompletedTask, indexOfLastCompletedTask);
    const totalCompletedTasksPages = Math.ceil(completedTasks.length / completedTasksPerPage);

    const paginateCompletedTasks = (pageNumber) => setCurrentCompletedTasksPage(pageNumber);

    // --- Task Action Handlers (Backend-Ready Structure) ---

    const handleViewApplicants = useCallback((task) => {
        setSelectedTaskForApplicants(task);
        setShowApplicantsModal(true);
    }, []);

    const handleHireApplicant = useCallback(async (taskId, applicantId, applicantName) => {
        console.log(`Attempting to hire applicant ${applicantName} (ID: ${applicantId}) for task ID: ${taskId}`);

        // --- Backend Integration: Uncomment and replace mock logic ---
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('Authentication required to perform this action.');
            navigate('/login');
            return;
        }
        const api = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        try {
            // Replace with your actual hire endpoint
            // Example: PUT /api/client/jobs/:taskId/hire
            const response = await api.put(`/client/jobs/${taskId}/hire`, { applicantId });

            // Assuming your backend responds with the updated task
            const updatedTaskFromBackend = response.data.task; // Adjust based on actual backend response structure

            setAllTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId
                        ? { ...task, ...updatedTaskFromBackend } // Merge backend update
                        : task
                )
            );
            setShowApplicantsModal(false);
            alert(`Successfully hired ${applicantName} for the task!`);
        } catch (error) {
            console.error('Error hiring applicant:', error.response ? error.response.data : error.message);
            alert(`Failed to hire applicant: ${error.response?.data?.message || 'Please try again.'}`);
        }

        // --- Mocked success for frontend demo (Comment out when backend is active) ---
        // const updatedTasks = allTasks.map(task =>
        //     task.id === taskId
        //         ? { ...task, status: 'filled', selectedApplicantId: applicantId, selectedApplicantName: applicantName, filledDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
        //         : task
        // );
        // setAllTasks(updatedTasks);
        // setShowApplicantsModal(false);
        // alert(`Successfully hired ${applicantName} for the task!`);
    }, [allTasks, navigate]); // Added navigate to dependency array

    const handleMarkAsFilled = useCallback(async (taskId) => {
        console.log(`Attempting to mark task ID: ${taskId} as filled`);

        // --- Backend Integration: Uncomment and replace mock logic ---
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('Authentication required to perform this action.');
            navigate('/login');
            return;
        }
        const api = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        try {
            // Replace with your actual mark-as-filled endpoint
            // Example: PUT /api/client/jobs/:taskId/mark-filled
            const response = await api.put(`/client/jobs/${taskId}/mark-filled`);

            const updatedTaskFromBackend = response.data.task; // Adjust based on actual backend response structure

            setAllTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId
                        ? { ...task, ...updatedTaskFromBackend }
                        : task
                )
            );
            alert('Task marked as filled successfully!');
        } catch (error) {
            console.error('Error marking task as filled:', error.response ? error.response.data : error.message);
            alert(`Failed to mark task as filled: ${error.response?.data?.message || 'Please try again.'}`);
        }

        // --- Mocked success for frontend demo (Comment out when backend is active) ---
        // const updatedTasks = allTasks.map(task =>
        //     task.id === taskId ? { ...task, status: 'filled', filledDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) } : task
        // );
        // setAllTasks(updatedTasks);
        // alert('Task marked as filled successfully!');
    }, [allTasks, navigate]); // Added navigate to dependency array

    const handleReopenJob = useCallback(async (taskId) => {
        console.log(`Attempting to reopen task ID: ${taskId}`);

        // --- Backend Integration: Uncomment and replace mock logic ---
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('Authentication required to perform this action.');
            navigate('/login');
            return;
        }
        const api = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        try {
            // Replace with your actual reopen endpoint
            // Example: PUT /api/client/jobs/:taskId/reopen
            const response = await api.put(`/client/jobs/${taskId}/reopen`);

            const updatedTaskFromBackend = response.data.task; // Adjust based on actual backend response structure

            setAllTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId
                        ? { ...task, ...updatedTaskFromBackend }
                        : task
                )
            );
            alert('Job reopened successfully!');
        } catch (error) {
            console.error('Error reopening job:', error.response ? error.response.data : error.message);
            alert(`Failed to reopen job: ${error.response?.data?.message || 'Please try again.'}`);
        }

        // --- Mocked success for frontend demo (Comment out when backend is active) ---
        // const updatedTasks = allTasks.map(task =>
        //     task.id === taskId ? { ...task, status: 'open', selectedApplicantId: null, selectedApplicantName: null, filledDate: null } : task
        // );
        // setAllTasks(updatedTasks);
        // alert('Job reopened successfully!');
    }, [allTasks, navigate]); // Added navigate to dependency array

    const handleDeleteJob = useCallback(async (taskId, jobTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
            return;
        }
        console.log(`Attempting to delete task ID: ${taskId}`);

        // --- Backend Integration: Uncomment and replace mock logic ---
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('Authentication required to perform this action.');
            navigate('/login');
            return;
        }
        const api = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        try {
            // Replace with your actual delete endpoint
            // Example: DELETE /api/client/jobs/:taskId
            const response = await api.delete(`/client/jobs/${taskId}`);

            // Assuming success (200 OK or 204 No Content)
            if (response.status === 200 || response.status === 204) {
                setAllTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
                alert(`"${jobTitle}" deleted successfully!`);
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }

        } catch (error) {
            console.error('Error deleting job:', error.response ? error.response.data : error.message);
            alert(`Failed to delete job: ${error.response?.data?.message || 'Please try again.'}`);
        }

        // --- Mocked success for frontend demo (Comment out when backend is active) ---
        // setAllTasks(allTasks.filter(task => task.id !== taskId));
        // alert(`"${jobTitle}" deleted successfully!`);
    }, [allTasks, navigate]); // Added navigate to dependency array

    const handlePostTask = useCallback(async (e) => {
        e.preventDefault();

        const newTaskPayload = { // Data to send to backend
            jobTitle,
            category,
            budget: parseInt(budget), // Ensure budget is a number
            description,
            dueDate: deadline, // Backend might expect a specific date format
            location,
            // Backend might handle applicants, filledDate, status, selectedApplicant internally
        };

        console.log('Attempting to post new task:', newTaskPayload);

        // --- Backend Integration: Uncomment and replace mock logic ---
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('Authentication required to post a task.');
            navigate('/login');
            return;
        }
        const api = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        try {
            // Replace with your actual create task endpoint
            // Example: POST /api/client/jobs
            const response = await api.post('/client/jobs', newTaskPayload);

            const postedTaskFromBackend = response.data.task; // Adjust based on actual backend response structure

            setAllTasks(prevTasks => [...prevTasks, postedTaskFromBackend]); // Add the job returned by backend
            alert('Task Posted successfully!');
        } catch (error) {
            console.error('Error posting task:', error.response ? error.response.data : error.message);
            alert(`Failed to post task: ${error.response?.data?.message || 'Please try again.'}`);
        }

        // --- Mocked success for frontend demo (Comment out when backend is active) ---
        // const newTaskMock = {
        //     id: Math.max(...allTasks.map(t => t.id), 0) + 1, // Simple ID generation for demo
        //     jobTitle, category, budget: parseInt(budget), description, dueDate: deadline,
        //     location, applicants: [], filledDate: null, status: 'open',
        //     selectedApplicantId: null, selectedApplicantName: null
        // };
        // setAllTasks(prevTasks => [...prevTasks, newTaskMock]);
        // alert('Task Posted successfully!');

        // Reset form fields regardless of success/failure for UX
        setJobTitle('');
        setCategory('');
        setBudget('');
        setDescription('');
        setDeadline('');
        setLocation('');
    }, [jobTitle, category, budget, description, deadline, location, allTasks, navigate]); // Added navigate and allTasks to dependency array

    const handleViewApplicantInfo = useCallback((applicantId) => {
        navigate(`/client/applicant-info/${applicantId}`);
    }, [navigate]);

    // Render loading/error states for initial dashboard load
    if (isLoading) {
        return <div className="loading-state">Loading dashboard data...</div>;
    }

    if (error) {
        return <div className="error-state">Error: {error}. Please try again or refresh.</div>;
    }

    return (
        <div className="client-dashboard-container flex flex-column">
            {/* ... (rest of your JSX rendering remains the same) ... */}
            <div className="client-dashboard-header flex items-center">
                <h1 className="client-taskpay-title text-[32px] tracking-[3px] font-bold">Task<span>Pay</span></h1>
                <div className="client-dashboard-name-img-container flex flex-row leading-[15px]">
                    <div>
                        <p className="tracking-[3px] font-bold text-18px">Welcome, {clientProfile?.First_Name ? formatName(clientProfile.First_Name) : 'User'} {clientProfile?.Surname ? formatName(clientProfile.Surname) : ''}</p>
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
                        {currentTasks.length > 0 ? (
                            currentTasks.map(task => (
                                <div key={task.id} className={`task-card ${task.status === 'filled' ? 'filled-task' : task.status === 'closed' ? 'closed-task' : 'open-task'}`}>
                                    <h3>{task.jobTitle}
                                        {task.status === 'closed' && <span className="status-badge closed">Closed</span>}
                                        {task.status === 'filled' && <span className="status-badge filled">Filled</span>}
                                        {task.status === 'open' && <span className="status-badge open">Active</span>}
                                    </h3>
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
                                        {/* View Applicants button - only show if there are applicants */}
                                        {task.applicants && task.applicants.length > 0 && (
                                            <button
                                                className="view-applicants-button"
                                                onClick={() => handleViewApplicants(task)}
                                            >
                                                View Applicants({task.applicants.length})
                                            </button>
                                        )}

                                        {/* Dynamic buttons based on status */}
                                        {(task.status === 'filled' || task.status === 'closed') && (
                                            <button className="reopen-job-button" onClick={() => handleReopenJob(task.id)}>Reopen Job</button>
                                        )}
                                        {task.status === 'open' && (
                                            <>
                                                <button className="edit-button" onClick={() => alert(`Edit functionality for ${task.jobTitle}`)}>Edit</button>
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
        </div>
    );
}

export default ClientDashboard;