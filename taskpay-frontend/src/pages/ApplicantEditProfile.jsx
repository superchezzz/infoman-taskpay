// taskpay-frontend/src/pages/ApplicantEditProfile.jsx
import React, { useState } from 'react';
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
  const [profileData, setProfileData] = useState({
    personalInfo: {
      fullName: '',
      sex: '',
      civilStatus: '',
      dateOfBirth: '',
      placeOfBirth: '',
      disability: '',
      employmentStatus: '',
      email: '',
      phoneNumber: '',
      address: '',
    },
    educationalBackground: [], // Array of education objects
    workExperience: [],        // Array of work experience objects
    certifications: [],        // Array of certification objects
    preferredOccupations: {
      jobCategories: [],
      expectedSalaryRange: { min: '', max: '' },
      preferredLocations: [],
    },
    resume: null, // File object for resume
  });

  // Changed initial state to null so no section is open by default
  const [activeSection, setActiveSection] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleInputChange = (section, field, value) => {
    setProfileData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setProfileData((prevData) => {
      const newArray = [...prevData[section]];
      newArray[index] = {
        ...newArray[index],
        [field]: value,
      };
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

  const handleSaveAndContinue = (nextSection) => {
    // Here you would typically perform validation for the current section
    // and then update the activeSection
    setActiveSection(nextSection);
  };

  const handleSubmitProfile = () => {
    console.log('Submitting Profile:', profileData);
  };

  const navigate = useNavigate();

  // Helper function to toggle section visibility
  const toggleSection = (sectionName) => {
    setActiveSection(activeSection === sectionName ? null : sectionName);
  };

  return (
    <div className="applicant-edit-profile-container">
      <svg onClick={() => navigate('/applicant-dashboard')} className="back-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26.9834 3.33337H13.0167C6.95004 3.33337 3.33337 6.95004 3.33337 13.0167V26.9667C3.33337 33.05 6.95004 36.6667 13.0167 36.6667H26.9667C33.0334 36.6667 36.65 33.05 36.65 26.9834V13.0167C36.6667 6.95004 33.05 3.33337 26.9834 3.33337ZM22.9834 25C23.4667 25.4834 23.4667 26.2834 22.9834 26.7667C22.7334 27.0167 22.4167 27.1334 22.1 27.1334C21.7834 27.1334 21.4667 27.0167 21.2167 26.7667L15.3334 20.8834C14.85 20.4 14.85 19.6 15.3334 19.1167L21.2167 13.2334C21.7 12.75 22.5 12.75 22.9834 13.2334C23.4667 13.7167 23.4667 14.5167 22.9834 15L17.9834 20L22.9834 25Z" fill="#F3BD06"/>
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
            {activeSection === 'personalInfo' && (
              <PersonalInfoForm
                personalInfo={profileData.personalInfo}
                onInputChange={(field, value) => handleInputChange('personalInfo', field, value)}
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
            {activeSection === 'educationalBackground' && (
              <EducationalBackgroundForm
                educationalBackground={profileData.educationalBackground}
                onInputChange={(index, field, value) => handleArrayChange('educationalBackground', index, field, value)}
                onAddEducation={(newItem) => addToArray('educationalBackground', newItem)}
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
            {activeSection === 'workExperience' && (
              <WorkExperienceForm
                workExperience={profileData.workExperience}
                onInputChange={(index, field, value) => handleArrayChange('workExperience', index, field, value)}
                onAddWorkExperience={(newItem) => addToArray('workExperience', newItem)}
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
            {activeSection === 'certifications' && (
              <CertificationsForm
                certifications={profileData.certifications}
                onInputChange={(index, field, value) => handleArrayChange('certifications', index, field, value)}
                onAddCertification={(newItem) => addToArray('certifications', newItem)}
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
            {activeSection === 'preferredOccupations' && (
              <PreferredOccupationsForm
                preferredOccupations={profileData.preferredOccupations}
                onInputChange={(field, value) => handleInputChange('preferredOccupations', field, value)}
                onAddJobCategory={(category) => setProfileData(prevData => ({
                    ...prevData,
                    preferredOccupations: {
                        ...prevData.preferredOccupations,
                        jobCategories: [...prevData.preferredOccupations.jobCategories, category]
                    }
                }))}
                onRemoveJobCategory={(categoryToRemove) => setProfileData(prevData => ({
                    ...prevData,
                    preferredOccupations: {
                        ...prevData.preferredOccupations,
                        jobCategories: prevData.preferredOccupations.jobCategories.filter(cat => cat !== categoryToRemove)
                    }
                }))}
                onAddPreferredLocation={(location) => setProfileData(prevData => ({
                    ...prevData,
                    preferredOccupations: {
                        ...prevData.preferredOccupations,
                        preferredLocations: [...prevData.preferredOccupations.preferredLocations, location]
                    }
                }))}
                onRemovePreferredLocation={(locationToRemove) => setProfileData(prevData => ({
                    ...prevData,
                    preferredOccupations: {
                        ...prevData.preferredOccupations,
                        preferredLocations: prevData.preferredOccupations.preferredLocations.filter(loc => loc !== locationToRemove)
                    }
                }))}
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