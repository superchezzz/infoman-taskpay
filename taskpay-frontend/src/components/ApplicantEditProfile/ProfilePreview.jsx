import React from 'react';

const ProfilePreview = ({ profileData, allCategories, allLocations }) => {
  if (!profileData) {
    return <div className="profile-preview-container"><p>Loading preview...</p></div>;
  }

  // Helper functions to find the names from the IDs for preferences
  const getCategoryNames = () => {
    if (!profileData.Preferences?.jobCategoryIds || !allCategories) return 'N/A';
    return profileData.Preferences.jobCategoryIds
      .map(id => allCategories.find(cat => cat.CategoryID === id)?.CategoryName)
      .filter(Boolean)
      .join(', ');
  };

  const getLocationNames = () => {
    if (!profileData.Preferences?.locationIds || !allLocations) return 'N/A';
    return profileData.Preferences.locationIds
      .map(id => allLocations.find(loc => loc.LocationID === id)?.LocationName)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="profile-preview-container">
      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Personal Information</h3>
        </div>
        <div className="preview-details-grid">
            <p><strong>Full Name:</strong> {[profileData.First_Name, profileData.Middle_Name, profileData.Surname, profileData.Suffix].filter(Boolean).join(' ')}</p>
            <p><strong>Sex:</strong> {profileData.Sex || 'N/A'}</p>
            <p><strong>Civil Status:</strong> {profileData.Civil_Status || 'N/A'}</p>
            <p><strong>Date of birth:</strong> {profileData.DOB ? new Date(profileData.DOB).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Place of birth:</strong> {profileData.Place_of_Birth || 'N/A'}</p>
            <p><strong>Disability:</strong> {profileData.Disability || 'None'}</p>
            <p><strong>Employment status:</strong> {profileData.Emp_Status || 'N/A'}</p>
            <p><strong>Email:</strong> {profileData.UserAccountDetails?.Email || 'N/A'}</p>
            <p><strong>Phone Number:</strong> {profileData.Phone_Num || 'N/A'}</p>
            <p className="grid-span-2"><strong>Address:</strong> {[profileData.House_No, profileData.Brgy, profileData.City, profileData.Province].filter(Boolean).join(', ')}</p>
        </div>
      </div>

      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Educational Background</h3>
        </div>
        {profileData.Educations?.length > 0 ? (
          profileData.Educations.map((edu, index) => (
            <div key={index} className="education-entry-preview">
              <p><strong>{edu.Educational_Attainment || 'N/A'} in {edu.Course || 'N/A'}</strong></p>
              <p>{edu.Institution || 'N/A'}</p>
              <p>Graduated: {edu.Graduation_Year || 'N/A'}</p>
              {edu.Award && <p>Award: {edu.Award}</p>}
            </div>
          ))
        ) : (
          <p>No educational background added.</p>
        )}
      </div>

      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Work Experience</h3>
        </div>
        {profileData.WorkExperiences?.length > 0 ? (
          profileData.WorkExperiences.map((job, index) => (
            <div key={index} className="work-experience-entry-preview">
              <p><strong>{job.Position || 'N/A'}</strong> at {job.Cmp_Name || 'N/A'}</p>
              <p>{job.Start_Date ? new Date(job.Start_Date).toLocaleDateString() : 'N/A'} - {job.End_Date ? new Date(job.End_Date).toLocaleDateString() : 'Present'}</p>
              <p>{job.Status || 'N/A'}</p>
              {job.Responsibilities && <p>Responsibilities: {job.Responsibilities}</p>}
            </div>
          ))
        ) : (
          <p>No work experience added.</p>
        )}
      </div>

      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Certifications</h3>
        </div>
        {profileData.Certifications?.length > 0 ? (
          profileData.Certifications.map((cert, index) => (
            <div key={index} className="certification-entry-preview">
              <p><strong>{cert.Certification_Name || 'N/A'}</strong> from {cert.Issuing_Organization || 'N/A'}</p>
              <p>Issued: {cert.Start_Date ? new Date(cert.Start_Date).toLocaleDateString() : 'N/A'} - {cert.End_Date ? new Date(cert.End_Date).toLocaleDateString() : 'Present'}</p>
              {cert.Training_Duration && <p>Training duration: {cert.Training_Duration}</p>}
            </div>
          ))
        ) : (
          <p>No certifications added.</p>
        )}
      </div>

      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Preferences</h3>
        </div>
        <p><strong>Job Categories:</strong> {getCategoryNames()}</p>
        <p><strong>Expected Salary Range:</strong> {profileData.Preferences?.Exp_Salary_Min || 'N/A'} - {profileData.Preferences?.Exp_Salary_Max || 'N/A'}</p>
        <p><strong>Preferred Locations:</strong> {getLocationNames()}</p>
      </div>

      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Resume</h3>
        </div>
        {profileData.resume ? (
          <p>
            <span className="resume-filename">{profileData.resume.name}</span>
          </p>
        ) : (
          <p>No resume uploaded.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePreview;