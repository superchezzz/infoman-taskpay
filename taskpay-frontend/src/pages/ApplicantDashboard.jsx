/**
 * @file ApplicantDashboard.jsx
 * @description Component for the main dashboard for users with the 'applicant' role.
 *
 * @description
 * This component fetches and displays the applicant's profile and task applications.
 * Now includes modal functionalities for "Apply for New Task", "View Task History",
 * and "My Documents" based on provided mockups.
 *
 * @modification
 * The data fetching logic in `useEffect` has been updated to be more resilient.
 * It now correctly handles the 404 "Not Found" error from the applications API
 * without treating it as a fatal error for the entire page. This ensures the main
 * dashboard layout and profile information always render correctly, even if the
 * task application list is empty for a new user.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/ApplicantDashboard.css";
import TaskApplicationStatus from '../components/Card/taskApplicationStatus/taskApplicationStatus';
import { formatName } from "../utils/formatName.js";
import Modal from '../components/ApplicantDashboardModals/Modal.jsx';
import AvailableTaskItem from '../components/ApplicantDashboardModals/AvailableTaskItem.jsx';
import TaskHistoryItem from '../components/ApplicantDashboardModals/TaskHistoryItem.jsx';
import DocumentsForm from '../components/ApplicantDashboardModals/DocumentsForm.jsx';
import '../styles/Modal.css';
import { getClientInitials } from "../utils/formatName.js";

function ApplicantDashboard() {
    const [applicantProfile, setApplicantProfile] = useState(null);
    // --- CHANGE 1: We now have two separate states for our lists.
    const [activeApplications, setActiveApplications] = useState([]);
    const [historicalApplications, setHistoricalApplications] = useState([]);
    const [submissionStatus, setSubmissionStatus] = useState({ message: '', isError: false });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Modal states
    const [isMyTaskDetailModalOpen, setIsMyTaskDetailModalOpen] = useState(false);
    const [isApplyForNewTaskModalOpen, setIsApplyForNewTaskModalOpen] = useState(false);
    const [isTaskHistoryModalOpen, setIsTaskHistoryModalOpen] = useState(false);
    const [isMyDocumentsModalOpen, setIsMyDocumentsModalOpen] = useState(false);

    // State to hold the task being viewed in the detail modal
    const [currentViewedTask, setCurrentViewedTask] = useState(null);

    // State for Available Tasks pagination (this part is unchanged)
    const [availableTasks, setAvailableTasks] = useState([]);
    const [availableTasksCurrentPage, setAvailableTasksCurrentPage] = useState(1);
    const [availableTasksTotalPages, setAvailableTasksTotalPages] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [availableTasksLimit, setAvailableTasksLimit] = useState(10); // Define items per page, e.g., 5
    
    // --- CHANGE 2: The 'taskHistory' state and its pagination are no longer needed.
    // They have been removed.

    const [documents, setDocuments] = useState(null);

    // Function to fetch available tasks with pagination (unchanged)
    const fetchAvailableTasks = async (pageToFetch = 1) => {
        try {
            const authToken = localStorage.getItem('authToken');
            const api = axios.create({
                baseURL: 'http://localhost:3001/api', 
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const response = await api.get(`/tasks/available?page=${pageToFetch}&limit=${availableTasksLimit}`);

            setAvailableTasks(response.data.tasks || []);
            setAvailableTasksCurrentPage(response.data.currentPage);
            setAvailableTasksTotalPages(response.data.totalPages);

        } catch (error) {
            console.error("Error fetching available tasks:", error);
            alert("Could not load available tasks. Please try again.");
            setAvailableTasks([]);
            setAvailableTasksCurrentPage(1);
            setAvailableTasksTotalPages(1);
        }
    };

    // --- CHANGE 3: The fetchTaskHistory function is no longer needed and has been deleted.
    // The data now comes from the main fetchDashboardData call.

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError('');

            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                setError('You are not authorized. Please log in.');
                setIsLoading(false);
                navigate('/login');
                return;
            }

            const api = axios.create({
                baseURL: 'http://localhost:3001/api',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            // --- CHANGE 4: The try block now populates our two new lists. ---
            try {
                const response = await api.get('/profile/dashboard');
            
                // Populate the new active and historical states from the API
                setApplicantProfile(response.data.profile);
                setActiveApplications(response.data.activeApplications || []);
                setHistoricalApplications(response.data.historicalApplications || []);
            
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                const errorMessage = err.response?.data?.message || "Could not load your dashboard. Please try logging in again.";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (isLoading) {
        return <div className="loading-container">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    const getFullName = (profile) => {
        if (!profile) return '';
        const parts = [profile.First_Name, profile.Middle_Name, profile.Surname, profile.Suffix];
        return parts.filter(Boolean).join(' ');
    };

    // --- Modal Handlers ---
    const handleCloseModal = (modalSetter) => () => {
        modalSetter(false);
        if (modalSetter === setIsMyTaskDetailModalOpen) {
            setCurrentViewedTask(null); // Clear viewed task when closing the detail modal
        }
    };

    // This function is unchanged
    const handleViewAnyTaskDetail = (item) => {
        const taskData = item.TaskDetails || item;
    
        const formattedTaskForModal = {
            id: item.ApplicationID || taskData.TaskID,
            title: taskData.Title,
            description: taskData.Description,
            budget: taskData.Budget,
            posted: taskData.PostedDate ? new Date(taskData.PostedDate).toLocaleDateString() : 'N/A',
            deadline: taskData.Deadline ? new Date(taskData.Deadline).toLocaleDateString() : 'N/A',
            duration: taskData.Duration,
            applicants: taskData.applicantCount !== undefined ? taskData.applicantCount : 'N/A',
            client: taskData.ClientName,
            category: taskData.Category,
            location: taskData.Location,
            status: item.Status,
        };
        
        setCurrentViewedTask(formattedTaskForModal);
        setIsMyTaskDetailModalOpen(true);
    };

    // This function is unchanged
    const handleApplyForNewTaskClick = async () => {
        await fetchAvailableTasks(1);
        setIsApplyForNewTaskModalOpen(true);
    };

    const handleApplyTask = async (task) => { // 'task' is the object from the "Available Tasks" modal
        try {
            const authToken = localStorage.getItem('authToken');
            const api = axios.create({
                baseURL: 'http://localhost:3001/api',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
    
            // 1. Capture the response from the server
            const response = await api.post(`/applications/tasks/${task.TaskID}/apply`);
    
            // --- THIS IS THE NEW LOGIC ---
    
            // 2. Get the new application record from the response
            const newApplicationFromServer = response.data.application;
    
            // 3. Create a complete object for our state, combining the new application data
            //    with the task details we already have.
            const newApplicationForState = {
                ...newApplicationFromServer,
                TaskDetails: task
            };
    
            // 4. Add the new application to the top of the active applications list
            setActiveApplications(prev => [newApplicationForState, ...prev]);
    
            // The rest of the function remains the same
            setSubmissionStatus({ message: `Successfully applied for ${task.Title}!`, isError: false });
    
            setTimeout(() => {
                setIsApplyForNewTaskModalOpen(false);
                // Also clear the submission status when closing the modal
                setSubmissionStatus({ message: '', isError: false });
            }, 2000);
    
        } catch (apiError) {
            console.error("Error applying for task:", apiError);
            const errorMessage = apiError.response?.data?.message || 'An unexpected error occurred.';
            setSubmissionStatus({ message: `Failed to apply: ${errorMessage}`, isError: true });
        }
    };

    // --- CHANGE 5: This function is no longer needed and has been deleted. ---
    // const handleViewTaskHistoryClick = async () => { ... }

    // This function is unchanged
    const handleMyDocumentsClick = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const api = axios.create({
                baseURL: 'http://localhost:3001/api',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const response = await api.get('/profile/documents');
            setDocuments(response.data);
            setIsMyDocumentsModalOpen(true);
        } catch (error) {
            console.error("Error fetching documents:", error);
            setDocuments({ tinNumber: '', sssNumber: '', philhealthNumber: '' });
            setIsMyDocumentsModalOpen(true);
        }
    };

    // This function is unchanged
    const handleUpdateDocuments = async (updatedDocs) => {
        try {
            const authToken = localStorage.getItem('authToken');
            const api = axios.create({
                baseURL: 'http://localhost:3001/api',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            await api.put('/profile/documents', updatedDocs);
            setDocuments(updatedDocs);
            alert('Documents updated successfully!');
            setIsMyDocumentsModalOpen(false);
        } catch (apiError) {
            console.error("Error updating documents:", apiError);
            alert(`Failed to update documents. ${apiError.response?.data?.message || ''}`);
        }
    };

    // This function is unchanged
    const handleStartTask = async (task) => {
        try {
            const authToken = localStorage.getItem('authToken');
            const api = axios.create({
                baseURL: 'http://localhost:3001/api',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            await api.post(`/applications/${task.id}/start`);
            alert(`Task '${task.title}' has been started!`);
            setIsMyTaskDetailModalOpen(false);
        } catch (apiError) {
            console.error("Error starting task:", apiError);
            alert(`Failed to start task '${task.title}'. ${apiError.response?.data?.message || ''}`);
        }
    };

    const handleWithdrawTask = async (task) => { // 'task' is the simplified object from the modal
        if (window.confirm(`Are you sure you want to withdraw from ${task.title}?`)) {
            try {
                const authToken = localStorage.getItem('authToken');
                const api = axios.create({
                    baseURL: 'http://localhost:3001/api',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
    
                // This API call is correct and works.
                await api.post(`/applications/${task.id}/withdraw`);
                alert(`Successfully withdrew from '${task.title}'.`);
    
                // --- THIS IS THE FIX ---
                // Instead of moving the simplified 'task' object, we find the original,
                // complete application object from our 'activeApplications' state.
                const applicationToMove = activeApplications.find(app => app.ApplicationID === task.id);
    
                if (applicationToMove) {
                    // 1. Remove the application from the active list
                    setActiveApplications(prev => prev.filter(app => app.ApplicationID !== task.id));
    
                    // 2. Add the complete application object to the historical list,
                    // ensuring its status is updated to 'Withdrawn' for immediate UI feedback.
                    setHistoricalApplications(prev => [...prev, { ...applicationToMove, Status: 'Withdrawn' }]);
                }
                
                // Close the modal
                setIsMyTaskDetailModalOpen(false);
    
            } catch (apiError) {
                console.error("Error withdrawing from task:", apiError);
                alert(`Failed to withdraw from task '${task.title}'. ${apiError.response?.data?.message || ''}`);
            }
        }
    };


    return (
        <div className="applicant-dashboard-container min-h-screen">
            {/* The header section is unchanged */}
            <div className="applicant-dashboard-header flex items-center">
                <h1 className="applicant-taskpay-title text-[32px] tracking-[3px] font-bold">Task<span>Pay</span></h1>
                <div className="applicant-dashboard-name-img-container flex flex-row leading-[15px]">
                    <div>
                        <p className="tracking-[3px] font-bold text-18px">Welcome, {formatName(applicantProfile?.First_Name) || 'User'}</p>
                        <p className="application-dashboard-text tracking-[3px] text-16px font-bold">Applicant Dashboard</p>
                    </div>
                    <div className="applicant-profile-initials">
                        {(applicantProfile?.First_Name?.charAt(0) || '').toUpperCase() +
                        (applicantProfile?.Surname?.charAt(0) || '').toUpperCase()}
                    </div>
                </div>
            </div>

            <div className="applicant-dashboard-body-container flex flex-row">
                {/* The "My Profile" section is unchanged */}
                <div className="my-profile-container">
                    <div className="my-profile-header flex flex-column items-center">
                        <svg width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.4615 16.765C20.1788 16.765 23.1923 13.6376 23.1923 9.77973C23.1923 5.92186 20.1788 2.79443 16.4615 2.79443C12.7442 2.79443 9.73071 5.92186 9.73071 9.77973C9.73071 13.6376 12.7442 16.765 16.4615 16.765Z" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M28.0249 30.7355C28.0249 25.3288 22.8422 20.9561 16.4614 20.9561C10.0806 20.9561 4.89795 25.3288 4.89795 30.7355" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16.4615 16.765C20.1788 16.765 23.1923 13.6376 23.1923 9.77973C23.1923 5.92186 20.1788 2.79443 16.4615 2.79443C12.7442 2.79443 9.73071 5.92186 9.73071 9.77973C9.73071 13.6376 12.7442 16.765 16.4615 16.765Z" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M28.0249 30.7355C28.0249 25.3288 22.8422 20.9561 16.4614 20.9561C10.0806 20.9561 4.89795 25.3288 4.89795 30.7355" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h1 className="text-[18px] font-semibold tracking-[3px]">My Profile</h1>
                    </div>
                    <div className="svg-line-wrapper">
                        <svg width="356" height="1" viewBox="0 0 356 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="4.11158e-08" y1="0.5" x2="356" y2="0.500033" stroke="#5A5A5A" strokeOpacity="0.15"/>
                        </svg>
                    </div>
                    {applicantProfile ? (
                        <div className="my-profile-info-container">
                            <div className="id-container items-center justify-items-center">
                                <h2>ID: APP-2025-{String(applicantProfile.Applicant_ID || '000').padStart(3, '0')}</h2>
                            </div>
                            <div className="my-profile-info">
                                <div className="profile-row"> <p>Full Name: </p><p className="profile-value">{getFullName(applicantProfile)}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" strokeOpacity="0.04"/>
                                </svg>
                                <div className="profile-row"><p>Sex: </p><p className="profile-value">{applicantProfile.Sex || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" strokeOpacity="0.04"/>
                                </svg>
                                <div className="profile-row"><p>Civil Status: </p><p className="profile-value"> {applicantProfile.CivilStatus || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" strokeOpacity="0.04"/>
                                </svg>
                                <div className="profile-row"><p>Date of Birth: </p><p className="profile-value">{applicantProfile.DoB || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" strokeOpacity="0.04"/>
                                </svg>
                                <div className="profile-row"><p>Address: </p><p className="profile-value">{applicantProfile.Address || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" strokeOpacity="0.04"/>
                                </svg>
                                <div className="profile-row"><p>Email: </p><p className="profile-value">{applicantProfile.Email || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" strokeOpacity="0.04"/>
                                </svg>
                            </div>
                            <div className="edit-profile-container" onClick={() => navigate("/applicant-edit-profile") }><p className="edit-profile-text">Edit Profile</p></div>
                        </div>
                    ) : (
                        <p>Profile information loading...</p>
                    )}
                </div>
                <div className="my-task-application-container">
                    <div><p className="text-[18px] font-semibold">My Task Application</p></div>
                    <div className="svg-line-wrapper">
                        <svg width="750" height="1" viewBox="0 0 750 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="4.14505e-08" y1="0.5" x2="750" y2="0.500062" stroke="#5A5A5A" strokeOpacity="0.15"/>
                        </svg>
                    </div>

                    {/* --- CHANGE 7: The main list now maps over `activeApplications` --- */}
                    {activeApplications.length > 0 ? activeApplications.map((application) => (
                        <TaskApplicationStatus
                            key={application.ApplicationID}
                            application={application}
                            onView={() => handleViewAnyTaskDetail(application)}
                        />
                    )) : (
                        <p>You have no active task applications.</p>
                    )}
                </div>
            </div>

            {/* Bottom 3 Functionality Cards */}
            <div className="applicant-dashboard-functionalities flex flex-row">
                <div className="apply-container cursor-pointer" onClick={handleApplyForNewTaskClick}>
                    <svg width="79" height="79" viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M53.9667 6.6665H26.0334C13.9001 6.6665 6.66675 13.8998 6.66675 26.0332V53.9332C6.66675 66.0998 13.9001 73.3332 26.0334 73.3332H53.9334C66.0667 73.3332 73.3001 66.0998 73.3001 53.9665V26.0332C73.3334 13.8998 66.1001 6.6665 53.9667 6.6665ZM60.0001 42.4998H42.5001V59.9998C42.5001 61.3665 41.3667 62.4998 40.0001 62.4998C38.6334 62.4998 37.5001 61.3665 37.5001 59.9998V42.4998H20.0001C18.6334 42.4998 17.5001 41.3665 17.5001 39.9998C17.5001 38.6332 18.6334 37.4998 20.0001 37.4998H37.5001V19.9998C37.5001 18.6332 38.6334 17.4998 40.0001 17.4998C41.3667 17.4998 42.5001 18.6332 42.5001 19.9998V37.4998H60.0001C61.3667 37.4998 62.5001 38.6332 62.5001 39.9998C62.5001 41.3665 61.3667 42.4998 60.0001 42.4998Z" fill="#FEC400"/>
                    </svg>
                    <h1 className="font-bold text-[24px]">Apply for New Task</h1>
                    <p className="text-[14px]">Browse available tasks and submit your application</p>
                </div>
                
                {/* --- CHANGE 8: The onClick for task history now simply opens the modal --- */}
                <div className="view-container cursor-pointer" onClick={() => setIsTaskHistoryModalOpen(true)}>
                    <svg width="81" height="80" viewBox="0 0 81 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M73.8334 73.3333H7.16675C5.80008 73.3333 4.66675 72.1999 4.66675 70.8333C4.66675 69.4666 5.80008 68.3333 7.16675 68.3333H73.8334C75.2001 68.3333 76.3334 69.4666 76.3334 70.8333C76.3334 72.1999 75.2001 73.3333 73.8334 73.3333Z" fill="#FEC400"/>
                        <path d="M33 13.3334V73.3334H48V13.3334C48 9.66675 46.5 6.66675 42 6.66675H39C34.5 6.66675 33 9.66675 33 13.3334Z" fill="#FEC400"/>
                        <path d="M10.5 33.3334V73.3334H23.8333V33.3334C23.8333 29.6667 22.5 26.6667 18.5 26.6667H15.8333C11.8333 26.6667 10.5 29.6667 10.5 33.3334Z" fill="#FEC400"/>
                        <path d="M57.1667 49.9999V73.3333H70.5001V49.9999C70.5001 46.3333 69.1667 43.3333 65.1667 43.3333H62.5001C58.5001 43.3333 57.1667 46.3333 57.1667 49.9999Z" fill="#FEC400"/>
                    </svg>
                    <h1 className="font-bold text-[24px]">View Task History</h1>
                    <p className="text-[14px]">Check your complete application and task history</p>
                </div>

                <div className="mydocs-container cursor-pointer" onClick={handleMyDocumentsClick}>
                    <svg width="81" height="80" viewBox="0 0 81 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M68.8334 53.3333V61.6667C68.8334 68.1 63.6001 73.3333 57.1668 73.3333H23.8334C17.4001 73.3333 12.1667 68.1 12.1667 61.6667V59.5C12.1667 54.2667 16.4334 50 21.6667 50H65.5001C67.3334 50 68.8334 51.5 68.8334 53.3333Z" fill="#FEC400"/>
                        <path d="M52.1667 6.66675H28.8334C15.5001 6.66675 12.1667 10.0001 12.1667 23.3334V48.6001C14.7001 46.3667 18.0334 45.0001 21.6667 45.0001H65.5001C67.3334 45.0001 68.8334 43.5001 68.8334 41.6667V23.3334C68.8334 10.0001 65.5001 6.66675 52.1667 6.66675ZM43.8334 35.8334H27.1667C25.8001 35.8334 24.6667 34.7001 24.6667 33.3334C24.6667 31.9667 25.8001 30.8334 27.1667 30.8334H43.8334C45.2001 30.8334 46.3334 31.9667 46.3334 33.3334C46.3334 34.7001 45.2001 35.8334 53.8334 24.1667H27.1667C25.8001 24.1667 24.6667 23.0334 24.6667 21.6667C24.6667 20.3001 25.8001 19.1667 27.1667 19.1667H53.8334C55.2001 19.1667 56.3334 20.3001 56.3334 21.6667C56.3334 23.0334 55.2001 24.1667 53.8334 24.1667Z" fill="#FEC400"/>
                    </svg>
                    <h1 className="font-bold text-[24px]">My Documents</h1>
                    <p className="text-[14px]">Manage TIN, SSS, PhilHealth and other documents</p>
                </div>
            </div>

            {/* --- Modals --- */}
            {/* All modals and their content are unchanged */}

            <Modal
                isOpen={isMyTaskDetailModalOpen}
                onClose={handleCloseModal(setIsMyTaskDetailModalOpen)}
                title={currentViewedTask?.title || 'Task Details'}
                zIndex={1002}
                headerClassName="task-detail-modal-title"
            >
                {currentViewedTask && (
                    <div className="task-detail-modal">
                        <div className="detail-header-info">
                            <div className="detail-client-info">
                                Client: <span className="client-initials">{getClientInitials(currentViewedTask.client)}</span>
                                <span className="client-name-full">{currentViewedTask.client}</span>
                            </div>
                            <div className="detail-meta-row">
                                <span className="detail-meta-item"><i className="icon-posted-date"></i> Posted: {currentViewedTask.posted || 'N/A'}</span>
                                <span className="detail-meta-item"><i className="icon-deadline-date"></i> Deadline: {currentViewedTask.deadline || 'N/A'}</span>
                                <span className="detail-meta-item"><i className="icon-category-detail"></i> {currentViewedTask.category || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="detail-task-stats-grid">
                            <div className="stat-box">
                                <span>P{currentViewedTask.budget}</span>
                                <span className="stat-label">Budget</span>
                            </div>
                            <div className="stat-box">
                                <span>{currentViewedTask.duration || 'N/A'}</span>
                                <span className="stat-label">Duration</span>
                            </div>
                            <div className="stat-box">
                                <span>{currentViewedTask.applicants}</span>
                                <span className="stat-label">Applicants</span>
                            </div>
                        </div>

                        <h4 className="task-description-header"><i className="icon-description-detail"></i> Task Description</h4>
                        <p className="task-description-text">{currentViewedTask.description}</p>

                        <div className="modal-actions">
                            {(currentViewedTask.status === 'Pending' || currentViewedTask.status === 'Approved') && (
                                <button
                                    className="withdraw-button"
                                    onClick={() => handleWithdrawTask(currentViewedTask)}
                                >
                                Withdraw Application
                                </button>
                            )}

                            {currentViewedTask.status === 'Approved' && (
                                <button
                                    className="start-task-button"
                                    onClick={() => handleStartTask(currentViewedTask)}
                                >
                                Start Task
                                </button>
                            )}
    
                            {currentViewedTask.status === 'InProgress' && (
                                <button className="update-progress-button">
                                Submit for Review
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isApplyForNewTaskModalOpen}
                onClose={() => {
                    setIsApplyForNewTaskModalOpen(false);
                    setSubmissionStatus({ message: '', isError: false });
                }}
                title="Available Tasks"
                zIndex={1001} 
            >
                {submissionStatus.message && (
                    <div className={submissionStatus.isError ? 'status-message error' : 'status-message success'}>
                        {submissionStatus.message}
                    </div>
                )}
                <div className="available-tasks-list">
                    {availableTasks.length > 0 ? (
                        availableTasks.map(task => (
                            <AvailableTaskItem
                                key={task.TaskID}
                                task={task}
                                onView={handleViewAnyTaskDetail}
                                onApply={handleApplyTask}
                            />
                        ))
                    ) : (
                        <p>There are currently no available tasks.</p>
                    )}
                    {availableTasksTotalPages > 0 && (
                        <div className="pagination">
                            <button
                                onClick={() => fetchAvailableTasks(availableTasksCurrentPage - 1)}
                                disabled={availableTasksCurrentPage === 1}
                            >
                                Previous
                            </button>
                            {[...Array(availableTasksTotalPages)].map((_, index) => (
                                <span
                                    key={index + 1}
                                    className={availableTasksCurrentPage === index + 1 ? 'active' : ''}
                                    onClick={() => fetchAvailableTasks(index + 1)}
                                >
                                    {index + 1}
                                </span>
                            ))}
                            <button
                                onClick={() => fetchAvailableTasks(availableTasksCurrentPage + 1)}
                                disabled={availableTasksCurrentPage === availableTasksTotalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* --- CHANGE 9: The Task History modal now maps over `historicalApplications` --- */}
            <Modal
                isOpen={isTaskHistoryModalOpen}
                onClose={handleCloseModal(setIsTaskHistoryModalOpen)}
                title="Task History"
                zIndex={1001}
            >
                <div className="task-history-list">
                    {historicalApplications.length > 0 ? (
                        historicalApplications.map(application => (
                            <TaskHistoryItem
                                key={application.ApplicationID}
                                task={application}
                                onView={() => handleViewAnyTaskDetail(application)}
                            />
                        ))
                    ) : (
                        <p>You have no items in your task history.</p>
                    )}
                    {/* The pagination for history has been removed to simplify */}
                </div>
            </Modal>

            <Modal
                isOpen={isMyDocumentsModalOpen}
                onClose={handleCloseModal(setIsMyDocumentsModalOpen)}
                title="My Documents"
                zIndex={1001}
            >
                <DocumentsForm
                    initialData={documents || { tinNumber: '', sssNumber: '', philhealthNumber: '' }}
                    onSubmit={handleUpdateDocuments}
                    onCancel={handleCloseModal(setIsMyDocumentsModalOpen)}
                />
            </Modal>
        </div>
    );
}

export default ApplicantDashboard;