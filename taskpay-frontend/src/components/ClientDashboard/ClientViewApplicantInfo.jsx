import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Uncomment when connecting to backend
import '../../styles/ClientViewApplicantInfo.css'; // Path relative to components/

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
            // In a real application, you'd fetch from your backend:
            // const authToken = localStorage.getItem('authToken');
            // const api = axios.create({
            //     baseURL: 'http://localhost:3001/api', // Your backend base URL
            //     headers: { 'Authorization': `Bearer ${authToken}` }
            // });
            try {
                // const response = await api.get(`/applicants/${applicantId}`);
                // setApplicantData(response.data);

                // --- MOCK DATA FOR DEMO without backend ---
                // This simulates a database lookup based on applicantId
                const mockApplicantsDatabase = {
                    101: {
                        personalInfo: {
                            fullName: "Maria Cruz Santos", sex: "Female", civilStatus: "Single",
                            dateOfBirth: "04/06/2004", placeOfBirth: "Manila, Philippines", disability: "None",
                            employmentStatus: "Employed", email: "maria.santos@example.com",
                            phoneNumber: "+639123456789", address: "123 Example Street, Manila, Philippines"
                        },
                        educationalBackground: [{ degree: "Bachelor's in Computer Science", institution: "Polytechnic University of the Philippines", achievements: "Awards: Best in Capstone" }],
                        workExperience: [{ title: "Software Developer", company: "Tech Solutions Inc.", duration: "January 2023 - Present", description: "Developed and maintained web applications." }],
                        certifications: [{ name: "AWS Certified Solutions Architect", issuingBody: "Amazon Web Services", dateIssued: "June 2023", expiration: "June 2026", description: "Expertise in AWS cloud architecture." }],
                        preferredOccupations: { jobCategories: ["Data Science", "AI/ML", "Web Development"], salaryRange: "₱50,000 - ₱70,000", preferredLocation: "Manila, Philippines" },
                        resumeUrl: "/dummy_resume_maria.pdf" // Specific resume for Maria
                    },
                    102: {
                        personalInfo: {
                            fullName: "Carlos Mendoza Reyes", sex: "Male", civilStatus: "Married",
                            dateOfBirth: "11/15/1998", placeOfBirth: "Cebu City, Philippines", disability: "None",
                            employmentStatus: "Unemployed", email: "carlos.reyes@example.com",
                            phoneNumber: "+639201234567", address: "456 Oak Ave, Cebu City, Philippines"
                        },
                        educationalBackground: [{ degree: "Bachelor of Fine Arts in Visual Communication", institution: "University of San Carlos", achievements: "" }],
                        workExperience: [{ title: "UX/UI Designer", company: "Design Solutions Co.", duration: "March 2020 - Dec 2023", description: "Designed user interfaces for mobile and web applications." }],
                        certifications: [{ name: "Google UX Design Professional Certificate", issuingBody: "Coursera", dateIssued: "Jan 2024", expiration: "N/A", description: "Completed a comprehensive UX design program." }],
                        preferredOccupations: { jobCategories: ["UI/UX", "Graphic Design"], salaryRange: "₱40,000 - ₱60,000", preferredLocation: "Cebu City, Philippines" },
                        resumeUrl: "/dummy_resume_carlos.pdf" // Specific resume for Carlos
                    },
                    103: {
                        personalInfo: {
                            fullName: "Joseph De magiba", sex: "Male", civilStatus: "Single",
                            dateOfBirth: "07/20/1995", placeOfBirth: "Davao City, Philippines", disability: "None",
                            employmentStatus: "Employed", email: "joseph.magiba@example.com",
                            phoneNumber: "+639309876543", address: "789 Pine St, Davao City, Philippines"
                        },
                        educationalBackground: [{ degree: "Master of Science in Data Science", institution: "De La Salle University", achievements: "Graduated with Honors" }],
                        workExperience: [{ title: "Data Scientist", company: "Analytic Minds", duration: "Sept 2022 - Present", description: "Developed machine learning models for business insights." }],
                        certifications: [{ name: "Microsoft Certified: Azure AI Engineer Associate", issuingBody: "Microsoft", dateIssued: "April 2023", expiration: "April 2025", description: "Proficiency in Azure AI services." }],
                        preferredOccupations: { jobCategories: ["Data Science", "AI/ML", "Cloud expert"], salaryRange: "₱60,000 - ₱80,000", preferredLocation: "Anywhere in Philippines" },
                        resumeUrl: "/dummy_resume_joseph.pdf"
                    },
                    104: {
                        personalInfo: {
                            fullName: "Anna Marie Tan", sex: "Female", civilStatus: "Married",
                            dateOfBirth: "02/28/1990", placeOfBirth: "Quezon City, Philippines", disability: "None",
                            employmentStatus: "Employed", email: "anna.tan@example.com",
                            phoneNumber: "+639451122334", address: "101 Maple St, Quezon City, Philippines"
                        },
                        educationalBackground: [{ degree: "Bachelor of Science in Business Administration", institution: "Ateneo de Manila University", achievements: "" }],
                        workExperience: [{ title: "Project Manager", company: "Global Projects Inc.", duration: "Jan 2018 - Present", description: "Managed cross-functional teams and project timelines." }],
                        certifications: [{ name: "PMP Certification", issuingBody: "PMI", dateIssued: "July 2019", expiration: "July 2025", description: "Certified Project Management Professional." }],
                        preferredOccupations: { jobCategories: ["Project Management", "Business Analysis"], salaryRange: "₱70,000 - ₱90,000", preferredLocation: "Metro Manila" },
                        resumeUrl: "/dummy_resume_anna.pdf"
                    },
                    201: {
                        personalInfo: {
                            fullName: "Benito Suarez", sex: "Male", civilStatus: "Single",
                            dateOfBirth: "09/05/2000", placeOfBirth: "Taguig City, Philippines", disability: "None",
                            employmentStatus: "Unemployed", email: "benito.suarez@example.com",
                            phoneNumber: "+639556789012", address: "202 Sunset Blvd, Taguig City, Philippines"
                        },
                        educationalBackground: [{ degree: "Diploma in Graphic Design", institution: "Philippine Institute of Design", achievements: "Best Portfolio Award" }],
                        workExperience: [{ title: "Junior Graphic Designer", company: "Creative Minds Studio", duration: "Nov 2022 - Oct 2023", description: "Assisted in designing logos, brochures, and web graphics." }],
                        certifications: [{ name: "Adobe Certified Professional (Photoshop)", issuingBody: "Adobe", dateIssued: "June 2023", expiration: "N/A", description: "Proficient in Adobe Photoshop." }],
                        preferredOccupations: { jobCategories: ["Graphic Design", "Branding"], salaryRange: "₱30,000 - ₱45,000", preferredLocation: "Metro Manila" },
                        resumeUrl: "/dummy_resume_benito.pdf"
                    },
                    202: {
                        personalInfo: {
                            fullName: "Clara Lim", sex: "Female", civilStatus: "Single",
                            dateOfBirth: "03/10/1999", placeOfBirth: "Manila, Philippines", disability: "None",
                            employmentStatus: "Employed", email: "clara.lim@example.com",
                            phoneNumber: "+639667890123", address: "303 Elm St, Manila, Philippines"
                        },
                        educationalBackground: [{ degree: "Bachelor of Science in Information Technology", institution: "University of the Philippines", achievements: "Dean's Lister" }],
                        workExperience: [{ title: "UX/UI Intern", company: "Innovate Solutions", duration: "Jan 2023 - Present", description: "Assisted in user research and wireframing." }],
                        certifications: [],
                        preferredOccupations: { jobCategories: ["UX Design", "Illustration"], salaryRange: "₱35,000 - ₱50,000", preferredLocation: "Metro Manila" },
                        resumeUrl: "/dummy_resume_clara.pdf"
                    },
                    301: {
                        personalInfo: {
                            fullName: "Diana Garcia", sex: "Female", civilStatus: "Married",
                            dateOfBirth: "01/25/1988", placeOfBirth: "Davao City, Philippines", disability: "None",
                            employmentStatus: "Self-Employed", email: "diana.garcia@example.com",
                            phoneNumber: "+639778901234", address: "404 Cedar St, Davao City, Philippines"
                        },
                        educationalBackground: [{ degree: "Bachelor of Arts in English Literature", institution: "University of Mindanao", achievements: "" }],
                        workExperience: [{ title: "Freelance Content Writer", company: "Self-Employed", duration: "Jan 2015 - Present", description: "Wrote articles, blog posts, and website copy for various clients." }],
                        certifications: [{ name: "Content Marketing Certification", issuingBody: "HubSpot Academy", dateIssued: "Sept 2020", expiration: "N/A", description: "Mastered content marketing strategies." }],
                        preferredOccupations: { jobCategories: ["Content Writing", "SEO"], salaryRange: "₱25,000 - ₱40,000", preferredLocation: "Remote" },
                        resumeUrl: "/dummy_resume_diana.pdf"
                    },
                    501: {
                        personalInfo: {
                            fullName: "Emilio Lopez", sex: "Male", civilStatus: "Single",
                            dateOfBirth: "06/18/1993", placeOfBirth: "Makati City, Philippines", disability: "None",
                            employmentStatus: "Employed", email: "emilio.lopez@example.com",
                            phoneNumber: "+639889012345", address: "505 Birch St, Makati City, Philippines"
                        },
                        educationalBackground: [{ degree: "Bachelor of Science in Marketing", institution: "University of Asia and the Pacific", achievements: "" }],
                        workExperience: [{ title: "Social Media Specialist", company: "Marketing Hub Co.", duration: "Mar 2018 - Present", description: "Managed social media campaigns and content." }],
                        certifications: [{ name: "Meta Certified Digital Marketing Associate", issuingBody: "Meta", dateIssued: "Oct 2021", expiration: "Oct 2024", description: "Proficient in Facebook and Instagram advertising." }],
                        preferredOccupations: { jobCategories: ["Social Media Marketing", "Community Management"], salaryRange: "₱40,000 - ₱60,000", preferredLocation: "Metro Manila" },
                        resumeUrl: "/dummy_resume_emilio.pdf"
                    },
                    502: {
                        personalInfo: {
                            fullName: "Fiona Dela Rosa", sex: "Female", civilStatus: "Single",
                            dateOfBirth: "04/01/1997", placeOfBirth: "Pasig City, Philippines", disability: "None",
                            employmentStatus: "Unemployed", email: "fiona.delarosa@example.com",
                            phoneNumber: "+639990123456", address: "606 Pine St, Pasig City, Philippines"
                        },
                        educationalBackground: [{ degree: "Bachelor of Arts in Communication", institution: "De La Salle-College of Saint Benilde", achievements: "" }],
                        workExperience: [{ title: "Digital Marketing Assistant", company: "Brand Builders Inc.", duration: "Feb 2021 - Jan 2024", description: "Assisted in developing and executing digital marketing strategies." }],
                        certifications: [],
                        preferredOccupations: { jobCategories: ["Digital Marketing", "Content Strategy"], salaryRange: "₱35,000 - ₱55,000", preferredLocation: "Metro Manila" },
                        resumeUrl: "/dummy_resume_fiona.pdf"
                    }
                };

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));

                const data = mockApplicantsDatabase[applicantId];
                if (data) {
                    setApplicantData(data);
                } else {
                    setError('Applicant not found.');
                }

            } catch (err) {
                console.error("Failed to fetch applicant details:", err);
                setError('Failed to load applicant details.');
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
    }, [applicantId]); // Re-fetch if applicantId changes

    if (isLoading) {
        return <div className="loading-state">Loading applicant details...</div>;
    }

    if (error) {
        return <div className="error-state">Error: {error}</div>;
    }

    if (!applicantData) {
        return <div className="no-data-state">No applicant data available.</div>;
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
                {applicantData.educationalBackground.length > 0 ? (
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
                {applicantData.workExperience.length > 0 ? (
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
                {applicantData.certifications.length > 0 ? (
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
                    <div><strong>Job Categories:</strong> {applicantData.preferredOccupations.jobCategories.join(', ')}</div>
                    <div><strong>Salary Range:</strong> {applicantData.preferredOccupations.salaryRange}</div>
                    <div><strong>Preferred Location:</strong> {applicantData.preferredOccupations.preferredLocation}</div>
                </div>
            </div>

            <div className="info-section resume-section">
                <h2>Resume</h2>
                {applicantData.resumeUrl ? (
                    <div className="resume-link-container">
                        <span className="file-name">Resume_{applicantData.personalInfo.fullName.replace(/\s/g, '_')}.pdf</span>
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