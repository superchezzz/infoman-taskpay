import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import axios from 'axios'; // Uncomment this and configure baseURL when connecting to backend
import { useNavigate } from 'react-router-dom';
import '../styles/ClientDashboard.css'; // Path relative to pages/
import { formatName } from '../utils/formatName.js'; // Path relative to pages/

// Import new components located in src/components/
import ApplicantsModal from '../components/ClientDashboard/ApplicantsModal.jsx'; // Path relative to pages/

function ClientDashboard() {
    // --- State Management ---
    const [clientProfile, setClientProfile] = useState({
        First_Name: 'Juan',
        Surname: 'Dela Cruz',
        Email: 'juan.delacruz@example.com'
    });

    const [allTasks, setAllTasks] = useState([
        {
            id: 1,
            jobTitle: 'Website Redesign Project',
            location: 'Manila',
            budget: 2500,
            dueDate: 'July 17, 2025',
            applicants: [ // Dummy applicants for the modal
                { id: 101, name: 'Maria Cruz Santos', skills: ['Data Science', 'AI/ML', 'Web Development'] },
                { id: 102, name: 'Carlos Mendoza Reyes', skills: ['Data Science', 'UI/UX', 'Graphic Design'] },
                { id: 103, name: 'Joseph De magiba', skills: ['Data Science', 'AI/ML', 'Cloud expert'] },
                { id: 104, name: 'Anna Marie Tan', skills: ['Project Management', 'Business Analysis'] },
            ],
            filledDate: 'May 30, 2025',
            description: 'Looking for an experienced web developer to redesign our company website with modern UI/UX principles.',
            status: 'filled', // 'open', 'filled', 'closed'
            selectedApplicantId: 101,
            selectedApplicantName: 'Maria Cruz Santos'
        },
        {
            id: 2,
            jobTitle: 'Logo Design for Startup',
            location: 'Manila',
            budget: 500,
            dueDate: 'July 17, 2025',
            applicants: [
                { id: 201, name: 'Benito Suarez', skills: ['Graphic Design', 'Branding'] },
                { id: 202, name: 'Clara Lim', skills: ['Illustration', 'UX Design'] },
            ],
            filledDate: null,
            description: 'Need a creative logo design for our new tech startup. Modern, clean, and professional look required.',
            status: 'open',
            selectedApplicantId: null,
            selectedApplicantName: null
        },
        {
            id: 3,
            jobTitle: 'Content Writing for Blog',
            location: 'Manila',
            budget: 800,
            dueDate: 'July 17, 2025',
            applicants: [
                { id: 301, name: 'Diana Garcia', skills: ['Content Writing', 'SEO'] },
            ],
            filledDate: null,
            description: 'Need a creative logo design for our new tech startup. Modern, clean, and professional look required.',
            status: 'open',
            selectedApplicantId: null,
            selectedApplicantName: null
        },
        {
            id: 4,
            jobTitle: 'Mobile App Development',
            location: 'Cebu',
            budget: 5000,
            dueDate: 'August 1, 2025',
            applicants: [], // No applicants yet for this task
            filledDate: null,
            description: 'Develop a cross-platform mobile application for our new service.',
            status: 'open',
            selectedApplicantId: null,
            selectedApplicantName: null
        },
        {
            id: 5,
            jobTitle: 'Social Media Manager',
            location: 'Remote',
            budget: 700,
            dueDate: 'July 25, 2025',
            applicants: [
                { id: 501, name: 'Emilio Lopez', skills: ['Social Media Marketing', 'Community Management'] },
                { id: 502, name: 'Fiona Dela Rosa', skills: ['Digital Marketing', 'Content Strategy'] },
            ],
            filledDate: null,
            description: 'Seeking a social media manager to handle our online presence and content scheduling.',
            status: 'open',
            selectedApplicantId: null,
            selectedApplicantName: null
        },
        {
            id: 6,
            jobTitle: 'Data Entry Project',
            location: 'Manila',
            budget: 300,
            dueDate: 'July 10, 2025',
            applicants: [],
            filledDate: null,
            description: 'Simple data entry for product catalog.',
            status: 'closed',
            selectedApplicantId: null,
            selectedApplicantName: null
        }
    ]);

    const [completedTasks, setCompletedTasks] = useState([
        {
            id: 101,
            jobTitle: 'Website Redesign Project',
            location: 'Manila',
            budget: 2500,
            duration: '7 days',
            completedBy: 'Maria Santos'
        },
        {
            id: 102,
            jobTitle: 'Mobile App Development',
            location: 'Manila',
            budget: 3400,
            duration: '7 days',
            completedBy: 'Maria Santos'
        },
        {
            id: 103,
            jobTitle: 'SEO Optimization',
            location: 'Davao',
            budget: 1200,
            duration: '5 days',
            completedBy: 'John Doe'
        },
        {
            id: 104,
            jobTitle: 'E-commerce Store Setup',
            location: 'Remote',
            budget: 1800,
            duration: '10 days',
            completedBy: 'Jane Smith'
        },
        {
            id: 105,
            jobTitle: 'Another Completed Task',
            location: 'Quezon City',
            budget: 600,
            duration: '3 days',
            completedBy: 'Peter Pan'
        },
    ]);

    const [stats, setStats] = useState({
        filledTasks: 0, // Will be calculated in useEffect
        openTasks: 0,   // Will be calculated in useEffect
        totalApplications: 0, // Will be calculated in useEffect
        completedTasks: 13 // Based on design, assuming this is cumulative or fetched differently
    });

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

    // --- Effects ---
    // Recalculate stats whenever allTasks changes
    useEffect(() => {
        const filled = allTasks.filter(task => task.status === 'filled').length;
        const open = allTasks.filter(task => task.status === 'open').length;
        const totalApps = allTasks.reduce((sum, task) => sum + (task.applicants ? task.applicants.length : 0), 0);

        setStats(prevStats => ({
            ...prevStats,
            filledTasks: filled,
            openTasks: open,
            totalApplications: totalApps
        }));
    }, [allTasks]);


    // --- Task Filtering and Pagination Logic ---
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

    // --- Task Action Handlers (Mocked Backend Interaction) ---

    // Function to handle viewing applicants modal
    const handleViewApplicants = useCallback((task) => {
        setSelectedTaskForApplicants(task);
        setShowApplicantsModal(true);
    }, []);

    // Function to handle hiring an applicant
    const handleHireApplicant = useCallback(async (taskId, applicantId, applicantName) => {
        console.log(`Hiring applicant ${applicantName} (ID: ${applicantId}) for task ID: ${taskId}`);
        // Simulate API call to hire applicant
        // try {
        //     const response = await axios.post(`/api/tasks/${taskId}/hire`, { applicantId });
        //     const hiredTaskData = response.data; // Assuming backend returns updated task
        //     const updatedTasks = allTasks.map(task =>
        //         task.id === taskId ? { ...task, ...hiredTaskData } : task // Merge API response
        //     );
        //     setAllTasks(updatedTasks);
        //     setShowApplicantsModal(false);
        //     alert(`Successfully hired ${applicantName} for the task.`);
        // } catch (error) {
        //     console.error('Error hiring applicant:', error);
        //     alert('Failed to hire applicant. Please try again.');
        // }

        // --- Mocked success for frontend demo ---
        const updatedTasks = allTasks.map(task =>
            task.id === taskId
                ? { ...task, status: 'filled', selectedApplicantId: applicantId, selectedApplicantName: applicantName, filledDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
                : task
        );
        setAllTasks(updatedTasks);
        setShowApplicantsModal(false);
        alert(`Successfully hired ${applicantName} for the task!`);
    }, [allTasks]);


    // Function to handle marking a task as filled
    const handleMarkAsFilled = useCallback(async (taskId) => {
        console.log(`Marking task ID: ${taskId} as filled`);
        // Simulate API call to mark as filled
        // try {
        //     const response = await axios.put(`/api/tasks/${taskId}/mark-filled`);
        //     const updatedTaskData = response.data; // Assuming backend returns updated task
        //     const updatedTasks = allTasks.map(task =>
        //         task.id === taskId ? { ...task, ...updatedTaskData } : task
        //     );
        //     setAllTasks(updatedTasks);
        //     alert('Task marked as filled successfully!');
        // } catch (error) {
        //     console.error('Error marking task as filled:', error);
        //     alert('Failed to mark task as filled. Please try again.');
        // }

        // --- Mocked success for frontend demo ---
        const updatedTasks = allTasks.map(task =>
            task.id === taskId ? { ...task, status: 'filled', filledDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) } : task
        );
        setAllTasks(updatedTasks);
        alert('Task marked as filled successfully!');
    }, [allTasks]);

    // Function to handle reopening a task
    const handleReopenJob = useCallback(async (taskId) => {
        console.log(`Reopening task ID: ${taskId}`);
        // Simulate API call to reopen job
        // try {
        //     const response = await axios.put(`/api/tasks/${taskId}/reopen`);
        //     const updatedTaskData = response.data;
        //     const updatedTasks = allTasks.map(task =>
        //         task.id === taskId ? { ...task, ...updatedTaskData } : task
        //     );
        //     setAllTasks(updatedTasks);
        //     alert('Job reopened successfully!');
        // } catch (error) {
        //     console.error('Error reopening job:', error);
        //     alert('Failed to reopen job. Please try again.');
        // }

        // --- Mocked success for frontend demo ---
        const updatedTasks = allTasks.map(task =>
            task.id === taskId ? { ...task, status: 'open', selectedApplicantId: null, selectedApplicantName: null, filledDate: null } : task
        );
        setAllTasks(updatedTasks);
        alert('Job reopened successfully!');
    }, [allTasks]);

    // Function to handle deleting a task
    const handleDeleteJob = useCallback(async (taskId, jobTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
            return;
        }
        console.log(`Deleting task ID: ${taskId}`);
        // Simulate API call to delete job
        // try {
        //     const response = await axios.delete(`/api/tasks/${taskId}`);
        //     if (response.status === 204) { // No Content, common for successful DELETE
        //         setAllTasks(allTasks.filter(task => task.id !== taskId));
        //         alert(`"${jobTitle}" deleted successfully!`);
        //     } else {
        //         throw new Error('Unexpected response status');
        //     }
        // } catch (error) {
        //     console.error('Error deleting job:', error);
        //     alert('Failed to delete job. Please try again.');
        // }

        // --- Mocked success for frontend demo ---
        setAllTasks(allTasks.filter(task => task.id !== taskId));
        alert(`"${jobTitle}" deleted successfully!`);
    }, [allTasks]);

    // Function to handle new task creation (mocked)
    const handlePostTask = useCallback(async (e) => {
        e.preventDefault();

        const newTask = {
            id: Math.max(...allTasks.map(t => t.id), 0) + 1, // Simple ID generation for demo
            jobTitle,
            category,
            budget: parseInt(budget),
            description,
            dueDate: deadline, // Format as YYYY-MM-DD
            location,
            applicants: [],
            filledDate: null,
            status: 'open', // New tasks are typically open
            selectedApplicantId: null,
            selectedApplicantName: null
        };

        console.log('Posting new task:', newTask);
        // Simulate API call to post new task
        // try {
        //     const response = await axios.post('/api/tasks', newTask);
        //     setAllTasks(prevTasks => [...prevTasks, response.data.newTask]); // Assuming API returns the new task
        //     alert('Task Posted successfully!');
        // } catch (error) {
        //     console.error('Error posting task:', error);
        //     alert('Failed to post task. Please try again.');
        // }

        // --- Mocked success for frontend demo ---
        setAllTasks(prevTasks => [...prevTasks, newTask]);
        alert('Task Posted successfully!');

        // Reset form fields
        setJobTitle('');
        setCategory('');
        setBudget('');
        setDescription('');
        setDeadline('');
        setLocation('');
    }, [jobTitle, category, budget, description, deadline, location, allTasks]);


    // Function to handle view applicant info navigation
    const handleViewApplicantInfo = useCallback((applicantId) => {
        // This will navigate to the ClientViewApplicantInfo component using React Router
        navigate(`/client/applicant-info/${applicantId}`);
    }, [navigate]);

    return (
        <div className="client-dashboard-container flex flex-column">
            {/* Header */}
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