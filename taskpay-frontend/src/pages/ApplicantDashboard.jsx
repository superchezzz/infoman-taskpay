/**
 * @file ApplicantDashboard.jsx
 * @description Component for the main dashboard for users with the 'applicant' role.
 *
 * @description
 * This component fetches and displays the applicant's profile and task applications.
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

function ApplicantDashboard() {
    // State to hold data fetched from the backend
    const [applicantProfile, setApplicantProfile] = useState(null);
    const [taskApplications, setTaskApplications] = useState([]);

    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // The useEffect hook runs once when the component mounts
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

            try {
                // We use Promise.allSettled to ensure both API calls complete,
                // even if one of them fails (e.g., returns a 404).
                const results = await Promise.allSettled([
                    api.get('/profile/form'),     // Promise 1: Get applicant's profile
                    api.get('/applications/my') // Promise 2: Get applicant's task applications
                ]);

                // Handle Profile Response (results[0])
                if (results[0].status === 'fulfilled') {
                    setApplicantProfile(results[0].value.data);
                } else {
                    // If fetching the profile fails, it's a critical error for the whole page.
                    console.error("Critical Error: Failed to fetch profile data:", results[0].reason.response?.data);
                    // Throw an error that will be caught by the main catch block.
                    throw new Error(results[0].reason.response?.data?.message || "Could not load your profile. Please try logging in again.");
                }

                // Handle Applications Response (results[1])
                if (results[1].status === 'fulfilled') {
                    // If the call was successful, set the applications state.
                    setTaskApplications(results[1].value.data.applications || []);
                } else {
                    // If the call failed, check if it was an expected 404 "Not Found".
                    if (results[1].reason.response?.status === 404) {
                        console.log('No task applications found for this user (which is okay).');
                        setTaskApplications([]); // Set to an empty array, NOT an error.
                    } else {
                        // For any other unexpected error (like a 500 server error),
                        // log it but don't crash the whole page.
                        console.warn("Could not fetch task applications:", results[1].reason.response?.data);
                        // We still set to an empty array so the rest of the page can render.
                        setTaskApplications([]);
                    }
                }

            } catch (err) {
                // This catch block will now only handle critical errors (like failing to fetch the profile).
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]); // Dependency array for useEffect

    // Display a loading message while data is being fetched
    if (isLoading) {
        return <div className="loading-container">Loading Dashboard...</div>;
    }

    // Display a general error message ONLY if a critical error occurred
    if (error) {
        return <div className="error-container">{error}</div>;
    }

    // --- Helper function for formatting full name safely ---
    const getFullName = (profile) => {
        if (!profile) return '';
        // Build the name string piece by piece to avoid extra spaces
        const parts = [profile.First_Name, profile.Middle_Name, profile.Surname, profile.Suffix];
        return parts.filter(Boolean).join(' '); // Filter out null/empty parts and join with spaces
    };

    // Render the main dashboard content
    return (
        <div className="applicant-dashboard-container min-h-screen">
            {/* Header section with safety checks */}
            <div className="applicant-dashboard-header flex items-center">
                <h1 className="applicant-taskpay-title text-[32px] tracking-[3px] font-bold">Task<span>Pay</span></h1>
                <div className="applicant-dashboard-name-img-container flex flex-row leading-[15px]">
                    <div>
                        <p className="tracking-[3px] font-bold text-18px">Welcome, {formatName(applicantProfile.First_Name) || 'User'}
</p>
                        <p className="application-dashboard-text tracking-[3px] text-16px font-bold">Applicant Dashboard</p>
                    </div>
                        <div className="applicant-profile-initials">
                        {(applicantProfile.First_Name?.charAt(0) || '').toUpperCase() +
                        (applicantProfile.Last_Name?.charAt(0) || '').toUpperCase()}
                    </div>
                </div>
                
            </div>

            {/* Main body with safety checks */}
            <div className="applicant-dashboard-body-container flex flex-row">
                <div className="my-profile-container">
                     <div className="my-profile-header flex flex-column items-center">
                        <svg width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.4615 16.765C20.1788 16.765 23.1923 13.6376 23.1923 9.77973C23.1923 5.92186 20.1788 2.79443 16.4615 2.79443C12.7442 2.79443 9.73071 5.92186 9.73071 9.77973C9.73071 13.6376 12.7442 16.765 16.4615 16.765Z" stroke="#5A5A5A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M28.0249 30.7355C28.0249 25.3288 22.8422 20.9561 16.4614 20.9561C10.0806 20.9561 4.89795 25.3288 4.89795 30.7355" stroke="#5A5A5A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16.4615 16.765C20.1788 16.765 23.1923 13.6376 23.1923 9.77973C23.1923 5.92186 20.1788 2.79443 16.4615 2.79443C12.7442 2.79443 9.73071 5.92186 9.73071 9.77973C9.73071 13.6376 12.7442 16.765 16.4615 16.765Z" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M28.0249 30.7355C28.0249 25.3288 22.8422 20.9561 16.4614 20.9561C10.0806 20.9561 4.89795 25.3288 4.89795 30.7355" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h1 className="text-[18px] font-semibold tracking-[3px]">My Profile</h1>
                    </div>
                    <div className="svg-line-wrapper">
                                <svg width="356" height="1" viewBox="0 0 356 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="4.11158e-08" y1="0.5" x2="356" y2="0.500033" stroke="#5A5A5A" stroke-opacity="0.15"/>
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
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" stroke-opacity="0.04"/>
                                </svg>

                                <div className="profile-row"><p>Sex: </p><p className="profile-value">{applicantProfile.Sex || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" stroke-opacity="0.04"/>
                                </svg>

                                <div className="profile-row"><p>Civil Status: </p><p className="profile-value"> {applicantProfile.CivilStatus || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" stroke-opacity="0.04"/>
                                </svg>

                                <div className="profile-row"><p>Date of Birth: </p><p className="profile-value">{applicantProfile.DoB || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" stroke-opacity="0.04"/>
                                </svg>

                                <div className="profile-row"><p>Address: </p><p className="profile-value">{applicantProfile.Address || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" stroke-opacity="0.04"/>
                                </svg>

                                <div className="profile-row"><p>Email: </p><p className="profile-value">{applicantProfile.Email || 'N/A'}</p></div>
                                <svg width="340" height="1" viewBox="0 0 358 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line y1="0.5" x2="358" y2="0.5" stroke="#5A5A5A" stroke-opacity="0.04"/>
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
                            <line x1="4.14505e-08" y1="0.5" x2="750" y2="0.500062" stroke="#5A5A5A" stroke-opacity="0.15"/>
                        </svg>
                    </div>
            
                    {taskApplications.length > 0 ? taskApplications.map((application) => (
                        <TaskApplicationStatus
                            key={application.ApplicationID}
                            jobTitle={application.TaskDetails?.Title || 'N/A'}
                            applicationDate={application.ApplicationDate ? new Date(application.ApplicationDate).toLocaleDateString() : 'N/A'}
                            salary={application.TaskDetails?.Budget || 'N/A'}
                            clientName={application.TaskDetails?.ClientName || 'N/A'}
                            applicationStatus={application.Status || 'N/A'}
                        />
                    )) : (
                        // This message will now be displayed inside the dashboard layout
                        <p>You have no active task applications.</p>
                    )}
                </div>
            </div>
            <div className="applicant-dashboard-functionalities flex flex-row">
                <div className="apply-container cursor-pointer" onClick={() => navigate('/tasks')}>
                    <svg width="79" height="79" viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M53.9667 6.6665H26.0334C13.9001 6.6665 6.66675 13.8998 6.66675 26.0332V53.9332C6.66675 66.0998 13.9001 73.3332 26.0334 73.3332H53.9334C66.0667 73.3332 73.3001 66.0998 73.3001 53.9665V26.0332C73.3334 13.8998 66.1001 6.6665 53.9667 6.6665ZM60.0001 42.4998H42.5001V59.9998C42.5001 61.3665 41.3667 62.4998 40.0001 62.4998C38.6334 62.4998 37.5001 61.3665 37.5001 59.9998V42.4998H20.0001C18.6334 42.4998 17.5001 41.3665 17.5001 39.9998C17.5001 38.6332 18.6334 37.4998 20.0001 37.4998H37.5001V19.9998C37.5001 18.6332 38.6334 17.4998 40.0001 17.4998C41.3667 17.4998 42.5001 18.6332 42.5001 19.9998V37.4998H60.0001C61.3667 37.4998 62.5001 38.6332 62.5001 39.9998C62.5001 41.3665 61.3667 42.4998 60.0001 42.4998Z" fill="#FEC400"/>
                    </svg>

                    <h1 className="font-bold text-[24px]">Apply for New Task</h1>
                    <p className="text-[14px]">Browse available tasks and submit your application</p>
                </div>
                <div className="view-container cursor-pointer">
                    <svg width="81" height="80" viewBox="0 0 81 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M73.8334 73.3333H7.16675C5.80008 73.3333 4.66675 72.1999 4.66675 70.8333C4.66675 69.4666 5.80008 68.3333 7.16675 68.3333H73.8334C75.2001 68.3333 76.3334 69.4666 76.3334 70.8333C76.3334 72.1999 75.2001 73.3333 73.8334 73.3333Z" fill="#FEC400"/>
                        <path d="M33 13.3334V73.3334H48V13.3334C48 9.66675 46.5 6.66675 42 6.66675H39C34.5 6.66675 33 9.66675 33 13.3334Z" fill="#FEC400"/>
                        <path d="M10.5 33.3334V73.3334H23.8333V33.3334C23.8333 29.6667 22.5 26.6667 18.5 26.6667H15.8333C11.8333 26.6667 10.5 29.6667 10.5 33.3334Z" fill="#FEC400"/>
                        <path d="M57.1667 49.9999V73.3333H70.5001V49.9999C70.5001 46.3333 69.1667 43.3333 65.1667 43.3333H62.5001C58.5001 43.3333 57.1667 46.3333 57.1667 49.9999Z" fill="#FEC400"/>
                    </svg>


                    <h1 className="font-bold text-[24px]">View Task History</h1>
                    <p className="text-[14px]">Check your complete application and task history</p>
                </div>
                <div className="mydocs-container cursor-pointer">
                    <svg width="81" height="80" viewBox="0 0 81 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M68.8334 53.3333V61.6667C68.8334 68.1 63.6001 73.3333 57.1668 73.3333H23.8334C17.4001 73.3333 12.1667 68.1 12.1667 61.6667V59.5C12.1667 54.2667 16.4334 50 21.6667 50H65.5001C67.3334 50 68.8334 51.5 68.8334 53.3333Z" fill="#FEC400"/>
                        <path d="M52.1667 6.66675H28.8334C15.5001 6.66675 12.1667 10.0001 12.1667 23.3334V48.6001C14.7001 46.3667 18.0334 45.0001 21.6667 45.0001H65.5001C67.3334 45.0001 68.8334 43.5001 68.8334 41.6667V23.3334C68.8334 10.0001 65.5001 6.66675 52.1667 6.66675ZM43.8334 35.8334H27.1667C25.8001 35.8334 24.6667 34.7001 24.6667 33.3334C24.6667 31.9667 25.8001 30.8334 27.1667 30.8334H43.8334C45.2001 30.8334 46.3334 31.9667 46.3334 33.3334C46.3334 34.7001 45.2001 35.8334 43.8334 35.8334ZM53.8334 24.1667H27.1667C25.8001 24.1667 24.6667 23.0334 24.6667 21.6667C24.6667 20.3001 25.8001 19.1667 27.1667 19.1667H53.8334C55.2001 19.1667 56.3334 20.3001 56.3334 21.6667C56.3334 23.0334 55.2001 24.1667 53.8334 24.1667Z" fill="#FEC400"/>
                    </svg>


                    <h1 className="font-bold text-[24px]">My Documents</h1>
                    <p className="text-[14px]">Manage TIN, SSS, PhilHealth and other documents</p>
                </div>
            </div>
        </div>
    );
}

export default ApplicantDashboard;