// taskpay-frontend/src/components/ProfilePreview.jsx
import React from 'react';

const ProfilePreview = ({ profileData }) => {
  return (
    <div className="profile-preview-container">
      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Personal Information</h3>
          {/* You could add an "Edit" button here to go back to editing */}
        </div>
        <div className="preview-details-grid">
            <p><strong>Full Name:</strong> {profileData.personalInfo.fullName || 'N/A'}</p>
            <p><strong>Sex:</strong> {profileData.personalInfo.sex || 'N/A'}</p>
            <p><strong>Civil Status:</strong> {profileData.personalInfo.civilStatus || 'N/A'}</p>
            <p><strong>Date of birth:</strong> {profileData.personalInfo.dateOfBirth || 'N/A'}</p>
            <p><strong>Place of birth:</strong> {profileData.personalInfo.placeOfBirth || 'N/A'}</p>
            <p><strong>Disability:</strong> {profileData.personalInfo.disability || 'None'}</p>
            <p><strong>Employment status:</strong> {profileData.personalInfo.employmentStatus || 'N/A'}</p>
            <p><strong>Email:</strong> {profileData.personalInfo.email || 'N/A'}</p>
            <p><strong>Phone Number:</strong> {profileData.personalInfo.phoneNumber || 'N/A'}</p>
            <p className="grid-span-2"><strong>Address:</strong> {profileData.personalInfo.address || 'N/A'}</p>
        </div>
      </div>

      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Educational Background</h3>
        </div>
        {profileData.educationalBackground.length > 0 ? (
          profileData.educationalBackground.map((edu, index) => (
            <div key={index} className="education-entry-preview">
              <p><strong>{edu.educationalAttainment || 'N/A'} in {edu.course || 'N/A'}</strong></p>
              <p>{edu.institution || 'N/A'}</p>
              <p>Graduated: {edu.graduationYear || 'N/A'}</p>
              {edu.award && <p>Award: {edu.award}</p>}
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
        {profileData.workExperience.length > 0 ? (
          profileData.workExperience.map((job, index) => (
            <div key={index} className="work-experience-entry-preview">
              <p><strong>{job.jobTitle || 'N/A'}</strong> at {job.company || 'N/A'}</p>
              <p>{job.startDate || 'N/A'} - {job.endDate || 'Present'}</p>
              <p>{job.status || 'N/A'}</p>
              {job.responsibilities && <p>Responsibilities: {job.responsibilities}</p>}
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
        {profileData.certifications.length > 0 ? (
          profileData.certifications.map((cert, index) => (
            <div key={index} className="certification-entry-preview">
              <p><strong>{cert.certificateName || 'N/A'}</strong> from {cert.issuingOrganization || 'N/A'}</p>
              <p>Issued: {cert.startDate || 'N/A'} - {cert.endDate || 'Present'}</p>
              {cert.trainingDuration && <p>Training duration: {cert.trainingDuration}</p>}
            </div>
          ))
        ) : (
          <p>No certifications added.</p>
        )}
      </div>

      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Preferred Occupations</h3>
        </div>
        <p><strong>Job Categories:</strong> {profileData.preferredOccupations.jobCategories.length > 0 ? profileData.preferredOccupations.jobCategories.join(', ') : 'N/A'}</p>
        <p><strong>Expected Salary Range:</strong> {profileData.preferredOccupations.expectedSalaryRange.min || 'N/A'} - {profileData.preferredOccupations.expectedSalaryRange.max || 'N/A'}</p>
        <p><strong>Preferred Locations:</strong> {profileData.preferredOccupations.preferredLocations.length > 0 ? profileData.preferredOccupations.preferredLocations.join(', ') : 'N/A'}</p>
      </div>

      <div className="preview-section">
        <div className="section-header-preview">
          <h3>Resume</h3>
        </div>
        {profileData.resume ? (
          <p>
            <span className="resume-filename">{profileData.resume.name}</span>
            <a
              href={URL.createObjectURL(profileData.resume)} // Create a temporary URL for download/view
              target="_blank"
              rel="noopener noreferrer"
              className="view-resume-button"
            >
              View
            </a>
          </p>
        ) : (
          <p>No resume uploaded.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePreview;