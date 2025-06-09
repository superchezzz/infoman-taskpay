import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import '../../styles/ClientViewApplicantInfo.css'; // Path relative to components/ClientDashboard/

// --- Backend Integration Setup ---
const API_BASE_URL = 'http://localhost:3001/api'; // Your backend API base URL

function ClientViewApplicantInfo() {
    const { applicantId } = useParams(); // Get applicantId from URL
    const navigate = useNavigate();

    const [applicantData, setApplicantData] = useState(null); // State to hold fetched applicant data
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplicantDetails = async () => {
            setIsLoading(true);
            setError(null);

            // Placeholder for authentication token
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
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
                // --- Backend Integration: Uncomment and replace mock data ---
                // Expected endpoint: GET /api/applicants/:applicantId
                const response = await api.get(`/applicants/${applicantId}`);
                setApplicantData(response.data.applicant); // Adjust based on actual backend response structure (e.g., response.data.applicant)

                // --- Mock Data Initialization (Comment out when backend is active) ---
                // This simulates a database lookup based on applicantId for frontend dev
                // const mockApplicantsDatabase = { /* ... (your large mock data object here) ... */ };
                // const data = mockApplicantsDatabase[applicantId];
                // if (data) {
                //     setApplicantData(data);
                // } else {
                //     setError('Applicant not found.');
                // }
                // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            } catch (err) {
                console.error("Failed to fetch applicant details:", err.response ? err.response.data : err.message);
                setError(`Failed to load applicant details: ${err.response?.data?.message || 'Please try again.'}`);
                // Handle specific error types, e.g., 404 not found, 401 unauthorized
                if (err.response && err.response.status === 401) {
                    navigate('/login'); // Redirect on unauthorized
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (applicantId) {
            fetchApplicantDetails();
        } else {
            setError('No applicant ID provided.');
            setIsLoading(false);
        }
    }, [applicantId, navigate]); // navigate is a dependency because it's used inside the effect

    if (isLoading) {
        return <div className="loading-state">Loading applicant details...</div>;
    }

    if (error) {
        return <div className="error-state">Error: {error}</div>;
    }

    if (!applicantData) {
        // This case might be reached if error is null but no data was found (e.g. backend returned empty)
        return <div className="no-data-state">No applicant data available for this ID.</div>;
    }

    return (
        <div className="applicant-info-container">
            <div className="info-header">
                <button onClick={() => navigate(-1)} className="back-button">← Dashboard</button>
                <h1>Client_View Applicant info</h1>
            </div>

            <div className="info-section">
                <h2>Personal Information</h2>
                <div className="info-grid">
                    <div><strong>Full Name:</strong> {applicantData.personalInfo.fullName}</div>
                    <div><strong>Sex:</strong> {applicantData.personalInfo.sex}</div>
                    <div><strong>Civil Status:</strong> {applicantData.personalInfo.civilStatus}</div>
                    <div><strong>Date of birth:</strong> {applicantData.personalInfo.dateOfBirth}</div>
                    <div><strong>Place of birth:</strong> {applicantData.personalInfo.placeOfBirth}</div>
                    <div><strong>Disability:</strong> {applicantData.personalInfo.disability}</div>
                    <div><strong>Employment status:</strong> {applicantData.personalInfo.employmentStatus}</div>
                    <div><strong>Email:</strong> {applicantData.personalInfo.email}</div>
                    <div><strong>Phone Number:</strong> {applicantData.personalInfo.phoneNumber}</div>
                    <div><strong>Address:</strong> {applicantData.personalInfo.address}</div>
                </div>
            </div>

            <div className="info-section">
                <h2>Educational Background</h2>
                {applicantData.educationalBackground?.length > 0 ? ( // Use optional chaining for safety
                    applicantData.educationalBackground.map((edu, index) => (
                        <div key={index} className="edu-item">
                            <p><strong>{edu.degree}</strong></p>
                            <p>{edu.institution}</p>
                            <p>{edu.achievements}</p>
                        </div>
                    ))
                ) : (
                    <p>No educational background provided.</p>
                )}
            </div>

            <div className="info-section">
                <h2>Work Experience</h2>
                {applicantData.workExperience?.length > 0 ? ( // Use optional chaining
                    applicantData.workExperience.map((work, index) => (
                        <div key={index} className="work-item">
                            <p><strong>{work.title}</strong> at {work.company}</p>
                            <p>{work.duration}</p>
                            <p>{work.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No work experience provided.</p>
                )}
            </div>

            <div className="info-section">
                <h2>Certifications</h2>
                {applicantData.certifications?.length > 0 ? ( // Use optional chaining
                    applicantData.certifications.map((cert, index) => (
                        <div key={index} className="cert-item">
                            <p><strong>{cert.name}</strong></p>
                            <p>{cert.issuingBody}</p>
                            <p>Issued: {cert.dateIssued}, Expires: {cert.expiration}</p>
                            <p>{cert.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No certifications provided.</p>
                )}
            </div>

            <div className="info-section">
                <h2>Preferred Occupations</h2>
                <div className="info-grid">
                    <div><strong>Job Categories:</strong> {applicantData.preferredOccupations.jobCategories?.join(', ') || 'N/A'}</div>
                    <div><strong>Salary Range:</strong> {applicantData.preferredOccupations.salaryRange || 'N/A'}</div>
                    <div><strong>Preferred Location:</strong> {applicantData.preferredOccupations.preferredLocation || 'N/A'}</div>
                </div>
            </div>

            <div className="info-section resume-section">
                <h2>Resume</h2>
                {applicantData.resumeUrl ? (
                    <div className="resume-link-container">
                        <span className="file-name">Resume_{applicantData.personalInfo.fullName?.replace(/\s/g, '_') || applicantData.id}.pdf</span>
                        <a href={applicantData.resumeUrl} target="_blank" rel="noopener noreferrer" className="view-resume-button">View</a>
                    </div>
                ) : (
                    <p>No resume available.</p>
                )}
            </div>
        </div>
    );
}

export default ClientViewApplicantInfo;