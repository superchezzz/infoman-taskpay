// taskpay-frontend/src/pages/ApplicantEditProfile.jsx
import React, { useState } from 'react';
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
    workExperience: [],      // Array of work experience objects
    certifications: [],      // Array of certification objects
    preferredOccupations: {
      jobCategories: [],
      expectedSalaryRange: { min: '', max: '' },
      preferredLocations: [],
    },
    resume: null, // File object for resume
  });

  const [activeSection, setActiveSection] = useState('personalInfo'); // To manage which section is open for editing
  const [isPreviewMode, setIsPreviewMode] = useState(false); // To toggle between edit and preview mode

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
    // This function will be called when "Edit Profile" is clicked at the bottom
    // You'll send `profileData` to your backend API here
    console.log('Submitting Profile:', profileData);
    // Example of API call:
    // fetch('/api/applicant/profile', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(profileData),
    // })
    // .then(response => response.json())
    // .then(data => console.log('Profile updated:', data))
    // .catch(error => console.error('Error updating profile:', error));
  };

  return (
    <div className="applicant-edit-profile-container">
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
          <div className="profile-section">
            <div className="section-header" onClick={() => setActiveSection('personalInfo')}>
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

          <div className="profile-section">
            <div className="section-header" onClick={() => setActiveSection('educationalBackground')}>
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

          <div className="profile-section">
            <div className="section-header" onClick={() => setActiveSection('workExperience')}>
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

          <div className="profile-section">
            <div className="section-header" onClick={() => setActiveSection('certifications')}>
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

          <div className="profile-section">
            <div className="section-header" onClick={() => setActiveSection('preferredOccupations')}>
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
                onSaveAndContinue={() => handleSaveAndContinue('resumeUpload')} // No next section after this, maybe just save?
              />
            )}
          </div>

          <div className="profile-section">
            <div className="section-header" onClick={() => setActiveSection('resumeUpload')}>
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