// taskpay-frontend/src/pages/ApplicantEditProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Corrected import for useNavigate
import PersonalInfoForm from '../components/ApplicantEditProfile/PersonalInfoForm.jsx';
import EducationalBackgroundForm from '../components/ApplicantEditProfile/EducationalBackgroundForm.jsx';
import WorkExperienceForm from '../components/ApplicantEditProfile/WorkExperienceForm.jsx';
import CertificationsForm from '../components/ApplicantEditProfile/CertificationsForm.jsx';
import PreferredOccupationsForm from '../components/ApplicantEditProfile/PreferredOccupationsForm.jsx';
import ResumeUpload from '../components/ApplicantEditProfile/ResumeUpload.jsx';
import ProfilePreview from '../components/ApplicantEditProfile/ProfilePreview.jsx';
import '../styles/ApplicantEditProfile.css';

const ApplicantEditProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [deletedEducationIds, setDeletedEducationIds] = useState([]);
  const [deletedWorkExperienceIds, setDeletedWorkExperienceIds] = useState([]);
  const [deletedCertificationIds, setDeletedCertificationIds] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

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

            const [profileRes, categoriesRes, locationsRes] = await Promise.all([
                api.get('/profile/form'),
                api.get('/lookups/categories'),
                api.get('/lookups/locations')
            ]);

            const backendProfileData = profileRes.data;

            // This transformation block now includes the fix for HouseNum_Street
            const transformedData = {
                ...backendProfileData,
                // --- THIS IS THE FIX for Personal Info display ---
                House_No: backendProfileData.HouseNum_Street, // Create frontend field from backend field

                Educations: backendProfileData.Educations?.map(edu => ({
                    ...edu,
                    Educational_Attainment: edu.Education_Level,
                    Institution: edu.School,
                    Award: edu.Awards,
                    Graduation_Year: edu.Yr_Grad
                })) || [],
                WorkExperiences: backendProfileData.WorkExperiences?.map(work => ({
                    ...work,
                    Start_Date: work.inclusive_date_from,
                    End_Date: work.inclusive_date_to,
                    Cmp_Name: work.CompanyDetails?.Cmp_Name,
                })) || [],
                Certifications: backendProfileData.Certifications?.map(cert => ({
                    ...cert,
                    Certification_Name: cert.Certifications,
                    Start_Date: cert.course_date_from,
                    End_Date: cert.course_date_to,
                })) || [],
                Preferences: {
                    ...(backendProfileData.Preferences || {}),
                    jobCategoryIds: backendProfileData.JobCategories?.map(cat => cat.CategoryID) || [],
                    locationIds: backendProfileData.Locations?.map(loc => loc.LocationID) || [],
                }
            };
            
            setProfileData(transformedData);
            setAllCategories(categoriesRes.data);
            setAllLocations(locationsRes.data);

        } catch (error) {
            console.error("Failed to fetch profile data", error);
            alert("Could not load your profile data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchProfileData();
  }, []);

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
      const updatedItem = { ...newArray[index] };

      if (section === 'Educations') {
          switch (field) {
              case 'Educational_Attainment':
                  updatedItem.Educ_Level = value; // Backend name
                  updatedItem.Educational_Attainment = value; // Frontend display name
                  break;
              case 'Institution':
                  updatedItem.School = value;
                  updatedItem.Institution = value;
                  break;
              case 'Award':
                  updatedItem.Awards = value;
                  updatedItem.Award = value;
                  break;
              case 'Graduation_Year':
                  updatedItem.Yr_Grad = value;
                  updatedItem.Graduation_Year = value;
                  break;
              default:
                  updatedItem[field] = value;
          }
      } else if (section === 'WorkExperiences') {
          // Your existing WorkExperiences mapping logic here
          switch (field) {
              case 'Start_Date': updatedItem.inclusive_date_from = value; updatedItem.Start_Date = value; break;
              case 'End_Date': updatedItem.inclusive_date_to = value; updatedItem.End_Date = value; break;
              case 'Cmp_Name':
                  updatedItem.Cmp_Name_Manual = value;
                  updatedItem.Cmp_Name = value; // Keep this for display in form
                  updatedItem.CompanyInfo_ID = null;
                  break;
              case 'Cmp_Address':
                  updatedItem.Cmp_Address_Manual = value;
                  updatedItem.Cmp_Address = value; // Keep this for display in form
                  updatedItem.CompanyInfo_ID = null;
                  break;
              default: updatedItem[field] = value;
          }
      } else if (section === 'Certifications') {
          switch (field) {
              case 'Certification_Name':
                  updatedItem.Certifications = value; // Backend property name
                  updatedItem.Certification_Name = value; // Frontend display name
                  break;
              case 'Start_Date':
                  updatedItem.course_date_from = value; // Backend property name
                  updatedItem.Start_Date = value; // Frontend display name
                  break;
              case 'End_Date':
                  updatedItem.course_date_to = value; // Backend property name
                  updatedItem.End_Date = value; // Frontend display name
                  break;
              default:
                  updatedItem[field] = value;
          }
      } else {
          updatedItem[field] = value;
      }

      newArray[index] = updatedItem;
      return {
          ...prevData,
          [section]: newArray,
      };
  });
};

  const addToArray = (section, newItem) => {
    let transformedItem = { ...newItem };

    // When adding a new education item, we need to map the frontend-friendly
    // names to the backend-friendly names so the data structure is consistent
    // with items loaded from the database.
    if (section === 'Educations') {
        transformedItem = {
            ...newItem,
            // Ensure both frontend and backend property names exist for consistency
            Educational_Attainment: newItem.Educational_Attainment, // from form
            Educ_Level: newItem.Educational_Attainment,             // for backend

            Institution: newItem.Institution,
            School: newItem.Institution,

            Course: newItem.Course,

            Graduation_Year: newItem.Graduation_Year,
            Yr_Grad: newItem.Graduation_Year,

            Award: newItem.Award,
            Awards: newItem.Award,
        };
    }
    
    // You can add similar 'if (section === ...)' blocks here for
    // WorkExperience or Certifications if they have similar issues.

    setProfileData((prevData) => ({
        ...prevData,
        [section]: [...(prevData[section] || []), transformedItem],
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
        console.error("Submit called but profileData is not ready.");
        return;
    }

    try {
        const authToken = localStorage.getItem('authToken');
        const api = axios.create({
            baseURL: 'http://localhost:3001/api',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const payload = {
            personalInfo: {
                Surname: profileData.Surname, First_Name: profileData.First_Name,
                Middle_Name: profileData.Middle_Name, Suffix: profileData.Suffix,
                Age: profileData.Age, Sex: profileData.Sex,
                Civil_Status: profileData.Civil_Status, DOB: profileData.DOB,
                Place_of_Birth: profileData.Place_of_Birth,
                HouseNum_Street: profileData.House_No, 
                Brgy: profileData.Brgy, City: profileData.City,
                Province: profileData.Province, TIN_No: profileData.TIN_No,
                SSS_No: profileData.SSS_No, Philhealth_No: profileData.Philhealth_No,
                Phone_Num: profileData.Phone_Num, Disability: profileData.Disability,
                Emp_Status: profileData.Emp_Status,
            },
            education: profileData.Educations?.map(edu => ({
                EducationEntryID: edu.EducationEntryID, Education_Level: edu.Educational_Attainment,
                School: edu.Institution, Course: edu.Course,
                Awards: edu.Award, Yr_Grad: edu.Graduation_Year
            })),
            workExperiences: profileData.WorkExperiences?.map(job => ({
                WorkExperienceID: job.WorkExperienceID, Position: job.Position,
                Cmp_Name: job.Cmp_Name, Cmp_Address: job.Cmp_Address,
                inclusive_date_from: job.Start_Date, inclusive_date_to: job.End_Date,
                Status: job.Status, Responsibilities: job.Responsibilities
            })),
            certifications: profileData.Certifications?.map(cert => ({
                CertificationEntryID: cert.CertificationEntryID, Certifications: cert.Certification_Name,
                Issuing_Organization: cert.Issuing_Organization,
                course_date_from: cert.Start_Date, course_date_to: cert.End_Date,
                Training_Duration: cert.Training_Duration
            })),
            preferences: {
              Exp_Salary_Min: profileData.Preferences?.Exp_Salary_Min || null,
              Exp_Salary_Max: profileData.Preferences?.Exp_Salary_Max || null,
              jobCategoryIds: profileData.Preferences?.jobCategoryIds || [],
              locationIds: profileData.Preferences?.locationIds || []
            },
            deletedIds: {
                education: deletedEducationIds,
                workExperience: deletedWorkExperienceIds,
                certifications: deletedCertificationIds
            }
        };

        // --- THIS IS THE DIAGNOSTIC STEP for the preferences issue ---
        console.log("Submitting this payload to backend:", JSON.stringify(payload, null, 2));

        await api.post('/profile/form', payload);
        alert('Profile updated successfully!');
        navigate('/applicant-dashboard');

    } catch (error) {
        console.error("An error occurred during profile submission:", error);
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
              <ProfilePreview
                profileData={profileData}
                allCategories={allCategories} // Pass the categories list
                allLocations={allLocations}   // Pass the locations list
              />
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
                      educationalBackground={profileData.Educations} // CORRECTED: Pass the data directly
                      onInputChange={(index, field, value) => handleArrayChange('Educations', index, field, value)}
                      onAddEducation={(newItem) => addToArray('Educations', newItem)}
                      onRemoveEducation={(index) => handleRemoveFromArray('Educations', 'EducationEntryID', index)}
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
                      allCategories={allCategories}
                      allLocations={allLocations}
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