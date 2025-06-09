// taskpay-frontend/src/pages/ApplicantEditProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Corrected import for useNavigate
import PersonalInfoForm from '../components/PersonalInfoForm.jsx';
import EducationalBackgroundForm from '../components/EducationalBackgroundForm.jsx';
import WorkExperienceForm from '../components/WorkExperienceForm.jsx';
import CertificationsForm from '../components/CertificationsForm.jsx';
import PreferredOccupationsForm from '../components/PreferredOccupationsForm.jsx';
import ResumeUpload from '../components/ResumeUpload.jsx';
import ProfilePreview from '../components/ProfilePreview.jsx';
import '../styles/ApplicantEditProfile.css';

const ApplicantEditProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [deletedEducationIds, setDeletedEducationIds] = useState([]);
  const [deletedWorkExperienceIds, setDeletedWorkExperienceIds] = useState([]);
  const [deletedCertificationIds, setDeletedCertificationIds] = useState([]);

  // useEffect to fetch data when the component loads
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const authToken = localStorage.getItem('authToken');
        const api = axios.create({
          baseURL: 'http://localhost:3001/api',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const response = await api.get('/profile/form');
              
        // --- START OF DATA TRANSFORMATION FOR DISPLAY ---
        const transformedData = {
            ...response.data, // Start with all fetched data

            // Transform Educations array for display
            Educations: response.data.Educations.map(edu => ({
              ...edu, // Keep original fields like EducationEntryID, Applicant_ID, Course
              Educational_Attainment: edu.Educ_Level, // Map Backend's 'Educ_Level' to Frontend's 'Educational_Attainment'
              Institution: edu.School,               // ADDED: Map Backend's 'School' to Frontend's 'Institution'
              Award: edu.Awards,                     // ADDED: Map Backend's 'Awards' to Frontend's 'Award'
              Graduation_Year: edu.Yr_Grad           // Map Backend's 'Yr_Grad' to Frontend's 'Graduation_Year'
            })),

            // Transform WorkExperiences array for display
            WorkExperiences: response.data.WorkExperiences.map(work => ({
                ...work, // Keep original fields like WorkExperienceID, Applicant_ID
                Start_Date: work.inclusive_date_from, // Map Backend -> Frontend
                End_Date: work.inclusive_date_to,     // Map Backend -> Frontend
                // Combine CompanyInfo_ID based fields for frontend display if available, otherwise manual
                Cmp_Name: work.CompanyDetails?.Cmp_Name || work.Cmp_Name_Manual,
                Cmp_Address: work.CompanyDetails?.Cmp_Address || work.Cmp_Address_Manual,
            })),

            // Transform Certifications array for display
            Certifications: response.data.Certifications.map(cert => ({
                ...cert, // Keep original fields like CertificationEntryID, Applicant_ID
                Certification_Name: cert.Certifications, // Map Backend -> Frontend (plural to singular)
                Start_Date: cert.course_date_from, // Map Backend -> Frontend
                End_Date: cert.course_date_to,     // Map Backend -> Frontend
            })),

            // Transform Preferences object for display
            // Ensure Preferences object exists before trying to access its properties
            Preferences: response.data.Preferences ? {
                ...response.data.Preferences, // Keep original fields like PreferenceEntryID, Applicant_ID
                Pref_Job_Categories: response.data.Preferences.Pref_Occupation, // Map Backend -> Frontend
                Pref_Locations: response.data.Preferences.Pref_Location,     // Map Backend -> Frontend
                Expected_Salary_Min: response.data.Preferences.Exp_Salary_Min, // Ensure new fields are mapped
                Expected_Salary_Max: response.data.Preferences.Exp_Salary_Max, // Ensure new fields are mapped
            } : null, // If no preferences exist, initialize as null or an empty object
        };
        // --- END OF DATA TRANSFORMATION FOR DISPLAY ---

        setProfileData(transformedData); // Set the transformed data to state
        console.log("Transformed Profile Data for Display:", transformedData); // Debugging: Check console to see the transformed data
      } catch (error) {
          console.error("Failed to fetch profile data", error);
          alert("Could not load your profile data. Please try again.");
      } finally {
          setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []); // The empty array [] means this runs once when the component mounts

  // Changed initial state to null so no section is open by default
  const [activeSection, setActiveSection] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleInputChange = (field, value) => {
    setProfileData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleRemoveFromArray = (section, indexToRemove) => {
    setProfileData((prevData) => {
      const newArray = prevData[section].filter((item, index) => {
        if (index === indexToRemove) {
          // If the item has an ID, it means it's an existing record from DB
          if (item.EducationEntryID && section === 'Educations') { // Check specific ID for each section
            setDeletedEducationIds(prev => [...prev, item.EducationEntryID]);
          } else if (item.WorkExperienceID && section === 'WorkExperiences') {
            setDeletedWorkExperienceIds(prev => [...prev, item.WorkExperienceID]);
          } else if (item.CertificationEntryID && section === 'Certifications') {
            setDeletedCertificationIds(prev => [...prev, item.CertificationEntryID]);
          }
          return false; // Filter out the item
        }
        return true; // Keep other items
      });

      return {
        ...prevData,
        [section]: newArray,
      };
    });
  };

  const handleArrayChange = (section, index, field, value) => {
    setProfileData((prevData) => {
      const newArray = [...prevData[section]];
      const updatedItem = { ...newArray[index] }; // Create a copy of the item to modify

      // --- MAPPING LOGIC FOR UPDATING NESTED ARRAY ITEMS ---
      if (section === 'Educations') {
        switch (field) {
          case 'Educational_Attainment':
            updatedItem.Educ_Level = value;
            updatedItem.Educational_Attainment = value; // Update frontend name for display
            break;
          case 'Institution':
            updatedItem.School = value;
            updatedItem.Institution = value; // Update frontend name for display
            break;
          case 'Award':
            updatedItem.Awards = value;
            updatedItem.Award = value; // Update frontend name for display
            break;
          case 'Graduation_Year':
            updatedItem.Yr_Grad = value;
            updatedItem.Graduation_Year = value; // Update frontend name for display
            break;
          default:
            updatedItem[field] = value; // For Course, etc.
        }
      } else if (section === 'WorkExperiences') {
        switch (field) {
            case 'Start_Date': updatedItem.inclusive_date_from = value; break;
            case 'End_Date': updatedItem.inclusive_date_to = value; break;
            case 'Cmp_Name':
                // When Cmp_Name is edited, assume it's a manual entry for now
                updatedItem.Cmp_Name_Manual = value;
                updatedItem.Cmp_Name = value; // Keep this for display in form
                updatedItem.CompanyInfo_ID = null; // Break link to existing company if typing new name
                break;
            case 'Cmp_Address':
                updatedItem.Cmp_Address_Manual = value;
                updatedItem.Cmp_Address = value; // Keep this for display in form
                updatedItem.CompanyInfo_ID = null; // Break link to existing company if typing new address
                break;
            default: updatedItem[field] = value;
        }
      } else if (section === 'Certifications') {
        switch (field) {
            case 'Certification_Name': updatedItem.Certifications = value; break;
            case 'Start_Date': updatedItem.course_date_from = value; break;
            case 'End_Date': updatedItem.course_date_to = value; break;
            default: updatedItem[field] = value;
        }
      } else {
        // Default behavior for other sections where frontend and backend field names directly match
        updatedItem[field] = value;
      }
      // --- END OF MAPPING LOGIC ---

      newArray[index] = updatedItem; // Assign the updated item back to the new array
      return {
        ...prevData,
        [section]: newArray,
      };
    });
  };

  const addToArray = (section, newItem) => {
    setProfileData((prevData) => ({
      ...prevData,
      [section]: [...prevData[section], newItem],
    }));
  };

  const handleResumeUpload = (file) => {
    setProfileData((prevData) => ({
      ...prevData,
      resume: file,
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setProfileData((prevData) => ({
      ...prevData,
      Preferences: {
        ...(prevData.Preferences || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveAndContinue = (nextSection) => {
    // Here you would typically perform validation for the current section
    // and then update the activeSection
    setActiveSection(nextSection);
  };

  const handleSubmitProfile = async () => {
    if (!profileData) {
        console.log("Submit button clicked, but profileData is not ready.");
        return;
    }

    console.log("1. Preparing to submit profile...");

    try {
        const authToken = localStorage.getItem('authToken');
        const api = axios.create({
            baseURL: 'http://localhost:3001/api',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // --- START OF DATA TRANSFORMATION ---
        const payload = {
            // Personal Info (top-level fields are usually direct matches or handled by backend)
            // Ensure these match your backend's Applicant model field names
            Surname: profileData.Surname,
            First_Name: profileData.First_Name,
            Middle_Name: profileData.Middle_Name,
            Suffix: profileData.Suffix,
            Age: profileData.Age,
            Sex: profileData.Sex,
            Civil_Status: profileData.Civil_Status,
            DOB: profileData.DOB,
            Place_of_Birth: profileData.Place_of_Birth,
            House_No: profileData.House_No,
            Street: profileData.Street,
            Brgy: profileData.Brgy,
            City: profileData.City,
            Province: profileData.Province,
            TIN_No: profileData.TIN_No,
            SSS_No: profileData.SSS_No,
            Philhealth_No: profileData.Philhealth_No,
            Landline: profileData.Landline,
            Phone_Num: profileData.Phone_Num,
            Disability: profileData.Disability,
            Emp_Status: profileData.Emp_Status,

            // Education: Map frontend 'Educations' array to backend 'education' array
            // EXCLUDE EducationEntryID to ensure new IDs are generated by backend after destroy
            // Education: Send current items (including IDs for existing) and deleted IDs
            education: {
              items: profileData.Educations.map(edu => ({
                  // Include ID if it exists (for existing entries), exclude for new ones
                  ...(edu.EducationEntryID && { EducationEntryID: edu.EducationEntryID }),
                  Educ_Level: edu.Educational_Attainment,
                  School: edu.Institution,
                  Course: edu.Course,
                  Awards: edu.Award,
                  Yr_Grad: edu.Graduation_Year
              })),
              deletedIds: deletedEducationIds
          },

          // Work Experiences: Send current items and deleted IDs
          workExperiences: {
              items: profileData.WorkExperiences.map(job => ({
                  // Include ID if it exists, exclude for new ones
                  ...(job.WorkExperienceID && { WorkExperienceID: job.WorkExperienceID }),
                  Position: job.Position,
                  Cmp_Name: job.Cmp_Name,
                  Cmp_Address: job.Cmp_Address,
                  inclusive_date_from: job.Start_Date,
                  inclusive_date_to: job.End_Date,
                  Status: job.Status,
                  Responsibilities: job.Responsibilities,
              })),
              deletedIds: deletedWorkExperienceIds
          },

          // Certifications: Send current items and deleted IDs
          certifications: {
              items: profileData.Certifications.map(cert => ({
                  // Include ID if it exists, exclude for new ones
                  ...(cert.CertificationEntryID && { CertificationEntryID: cert.CertificationEntryID }),
                  Certifications: cert.Certification_Name,
                  Issuing_Organization: cert.Issuing_Organization,
                  course_date_from: cert.Start_Date,
                  course_date_to: cert.End_Date,
                  Training_Duration: cert.Training_Duration,
              })),
              deletedIds: deletedCertificationIds
          },

            // Preferences: Map frontend 'Preferences' object
            // NOTE: Backend has 'Exp_Salary' (single decimal), Frontend has min/max
            preferences: {
                Pref_Occupation: profileData.Preferences?.Pref_Job_Categories || null, // Comma-separated string
                Pref_Location: profileData.Preferences?.Pref_Locations || null,     // Comma-separated string
                // Decide how to map min/max to a single Exp_Salary on backend:
                Exp_Salary: profileData.Preferences?.Expected_Salary_Min || null, // Sending min, adjust logic on backend or here
            }
        };
        // --- END OF DATA TRANSFORMATION ---

        console.log("2. Sending POST request to /api/profile/form with payload:", payload); // Checkpoint 2

        // Send the transformed payload to the backend
        await api.post('/profile/form', payload);

        console.log("3. Main profile submit request was successful!"); // Checkpoint 3

        // --- Resume Upload (Separate API Call) ---
        if (profileData.resume) {
            console.log("4. Attempting to upload resume...");
            const formData = new FormData();
            formData.append('resume', profileData.resume); // 'resume' must match field name in uploadMiddleware.js

            // You might need a separate API instance for file uploads if headers differ
            const uploadApi = axios.create({
                baseURL: 'http://localhost:3001/api',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data', // Crucial for file uploads
                },
            });
            await uploadApi.post('/uploads/resume', formData);
            console.log("5. Resume upload successful!");
        } else {
            console.log("4. No resume file to upload.");
        }
        // --- End Resume Upload ---

        alert('Profile updated successfully!');
        navigate('/applicant-dashboard');

    } catch (error) {
        console.error("An error occurred during submission:", error);
        // Provide more granular error messages if possible, e.g., error.response.data.errors
        alert(`Error: ${error.response?.data?.message || 'Could not save profile.'}`);
    }
};

  const navigate = useNavigate();

  // Helper function to toggle section visibility
  const toggleSection = (sectionName) => {
    setActiveSection(activeSection === sectionName ? null : sectionName);
  };

  if (isLoading) {
    return <div className="loading-container">Loading Profile...</div>;
  }

  return (
    <div className="applicant-edit-profile-container">
      <svg onClick={() => navigate('/applicant-dashboard')} className="back-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26.9834 3.33337H13.0167C6.95004 3.33337 3.33337 6.95004 3.33337 13.0167V26.9667C3.33337 33.05 6.95004 36.6667 13.0167 36.667H26.9667C33.0334 36.6667 36.65 33.05 36.65 26.9834V13.0167C36.6667 6.95004 33.05 3.33337 26.9834 3.33337ZM22.9834 25C23.4667 25.4834 23.4667 26.2834 22.9834 26.7667C22.7334 27.0167 22.4167 27.1334 22.1 27.1334C21.7834 27.1334 21.4667 27.0167 21.2167 26.7667L15.3334 20.8834C14.85 20.4 14.85 19.6 15.3334 19.1167L21.2167 13.2334C21.7 12.75 22.5 12.75 22.9834 13.2334C23.4667 13.7167 23.4667 14.5167 22.9834 15L17.9834 20L22.9834 25Z" fill="#F3BD06"/>
            </svg>
            <div className="profile-header">
              <h1>My Profile</h1>
              <button onClick={() => setIsPreviewMode(!isPreviewMode)}>
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
            </div>

            {isPreviewMode ? (
              <ProfilePreview profileData={profileData} />
            ) : (
              <>
                {/* Personal Information */}
                <div className="profile-section">
                  <div className="section-header" onClick={() => toggleSection('personalInfo')}>
                    <h2>Personal Information</h2>
                    <span>Full name, contact details, address</span>
                    <span className="arrow">{activeSection === 'personalInfo' ? '▲' : '►'}</span>
                  </div>
                  {activeSection === 'personalInfo' && profileData && (
                    <PersonalInfoForm
                      personalInfo={profileData}
                      onInputChange={handleInputChange} // Pass the new, simpler function
                      onSaveAndContinue={() => handleSaveAndContinue('educationalBackground')}
                    />
                  )}
                </div>

                {/* Educational Background */}
                <div className="profile-section">
                  <div className="section-header" onClick={() => toggleSection('educationalBackground')}>
                    <h2>Educational Background</h2>
                    <span>Degrees, institutions, graduation years</span>
                    <span className="arrow">{activeSection === 'educationalBackground' ? '▲' : '►'}</span>
                  </div>
                  {activeSection === 'educationalBackground' && profileData && (
                    <EducationalBackgroundForm
                      educationalBackground={profileData.Educations.map(edu => ({
                        ...edu,
                        Educational_Attainment: edu.Educ_Level,
                        Yr_Grad: edu.Yr_Grad
                      }))}
                      onInputChange={(index, field, value) => handleArrayChange('Educations', index, field, value)}
                      onAddEducation={(newItem) => addToArray('Educations', newItem)}
                      onRemoveEducation={(index) => handleRemoveFromArray('Educations', index)}
                      onSaveAndContinue={() => handleSaveAndContinue('workExperience')}
                    />
                  )}
                </div>

                {/* Work Experience */}
                <div className="profile-section">
                  <div className="section-header" onClick={() => toggleSection('workExperience')}>
                    <h2>Work Experience</h2>
                    <span>Previous jobs, roles, responsibilities</span>
                    <span className="arrow">{activeSection === 'workExperience' ? '▲' : '►'}</span>
                  </div>
                  {activeSection === 'workExperience' && profileData && (
                    <WorkExperienceForm
                      workExperience={profileData.WorkExperiences}
                      onInputChange={(index, field, value) => handleArrayChange('WorkExperiences', index, field, value)}
                      onAddWorkExperience={(newItem) => addToArray('WorkExperiences', newItem)}
                      onRemoveWorkExperience={(index) => handleRemoveFromArray('WorkExperiences', index)}
                      onSaveAndContinue={() => handleSaveAndContinue('certifications')}
                    />
                  )}
                </div>

                {/* Certifications */}
                <div className="profile-section">
                  <div className="section-header" onClick={() => toggleSection('certifications')}>
                    <h2>Certifications</h2>
                    <span>Professional certifications and licenses</span>
                    <span className="arrow">{activeSection === 'certifications' ? '▲' : '►'}</span>
                  </div>
                  {activeSection === 'certifications' && profileData && (
                    <CertificationsForm
                      certifications={profileData.Certifications}
                      onInputChange={(index, field, value) => handleArrayChange('Certifications', index, field, value)}
                      onAddCertification={(newItem) => addToArray('Certifications', newItem)}
                      onRemoveCertification={(index) => handleRemoveFromArray('Certifications', index)}
                      onSaveAndContinue={() => handleSaveAndContinue('preferredOccupations')}
                    />
                  )}
                </div>

                {/* Preferred Occupations */}
                <div className="profile-section">
                  <div className="section-header" onClick={() => toggleSection('preferredOccupations')}>
                    <h2>Preferred Occupations</h2>
                    <span>Job types and industries you're interested in</span>
                    <span className="arrow">{activeSection === 'preferredOccupations' ? '▲' : '►'}</span>
                  </div>
                  {activeSection === 'preferredOccupations' && profileData && (
                    <PreferredOccupationsForm
                      preferences={profileData.Preferences}
                      onPreferenceChange={handlePreferenceChange}
                      onSaveAndContinue={() => handleSaveAndContinue('resumeUpload')}
                    />
                  )}
                </div>

                <div className="profile-section">
                  <div className="section-header" onClick={() => toggleSection('resumeUpload')}>
                    <h2>Upload Resume (Optional)</h2>
                    <span>PDF, DOC, or DOCX format (Max. 5MB)</span>
                    <span className="arrow">{activeSection === 'resumeUpload' ? '▲' : '►'}</span>
                  </div>
                  {activeSection === 'resumeUpload' && (
                    <ResumeUpload
                      resumeFile={profileData.resume}
                      onFileUpload={handleResumeUpload}
                    />
                  )}
                </div>

                <button className="edit-profile-button" onClick={handleSubmitProfile}>
                  Edit Profile
                </button>
              </>
            )}
          </div>
        );
      };

export default ApplicantEditProfile; 