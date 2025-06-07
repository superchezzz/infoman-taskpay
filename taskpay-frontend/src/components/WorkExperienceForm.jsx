// taskpay-frontend/src/components/WorkExperienceForm.jsx
import React, { useState } from 'react';

const WorkExperienceForm = ({ workExperience, onInputChange, onAddWorkExperience, onSaveAndContinue }) => {
  const [newPosition, setNewPosition] = useState({
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '', // Can be empty if current
    status: '',
    responsibilities: '', // Added for more detail
  });

  const handleNewPositionChange = (field, value) => {
    setNewPosition(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPositionClick = () => {
    if (newPosition.jobTitle && newPosition.company && newPosition.startDate) {
      onAddWorkExperience(newPosition);
      setNewPosition({ // Reset form fields
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        status: '',
        responsibilities: '',
      });
    } else {
      alert('Please fill in required fields for work experience: Job Title, Company, and Start Date.');
    }
  };

  return (
    <div className="work-experience-form-content">
      {workExperience.map((job, index) => (
        <div key={index} className="work-experience-entry-card">
          <h3>Work Experience #{index + 1}</h3>
          <div className="form-group">
            <label htmlFor={`jobTitle-${index}`}>Job title</label>
            <input
              type="text"
              id={`jobTitle-${index}`}
              value={job.jobTitle}
              onChange={(e) => onInputChange(index, 'jobTitle', e.target.value)}
              placeholder="Your position"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`company-${index}`}>Company</label>
            <input
              type="text"
              id={`company-${index}`}
              value={job.company}
              onChange={(e) => onInputChange(index, 'company', e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor={`startDate-${index}`}>Start date</label>
              <input
                type="date"
                id={`startDate-${index}`}
                value={job.startDate}
                onChange={(e) => onInputChange(index, 'startDate', e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor={`endDate-${index}`}>End date</label>
              <input
                type="date"
                id={`endDate-${index}`}
                value={job.endDate}
                onChange={(e) => onInputChange(index, 'endDate', e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor={`status-${index}`}>Status</label>
            <input
              type="text" // Could be a select dropdown for "Current", "Previous"
              id={`status-${index}`}
              value={job.status}
              onChange={(e) => onInputChange(index, 'status', e.target.value)}
              placeholder="Enter your status"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`responsibilities-${index}`}>Responsibilities (Optional)</label>
            <textarea
              id={`responsibilities-${index}`}
              value={job.responsibilities}
              onChange={(e) => onInputChange(index, 'responsibilities', e.target.value)}
              placeholder="Briefly describe your responsibilities and achievements"
              rows="3"
            ></textarea>
          </div>
          {/* You might want a "Remove" button here for existing entries */}
        </div>
      ))}

      <div className="new-entry-section">
        <h3>Add New Work Experience</h3>
        <div className="form-group">
          <label htmlFor="newJobTitle">Job title</label>
          <input
            type="text"
            id="newJobTitle"
            value={newPosition.jobTitle}
            onChange={(e) => handleNewPositionChange('jobTitle', e.target.value)}
            placeholder="Your position"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newCompany">Company</label>
          <input
            type="text"
            id="newCompany"
            value={newPosition.company}
            onChange={(e) => handleNewPositionChange('company', e.target.value)}
            placeholder="Company name"
          />
        </div>
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="newStartDate">Start date</label>
            <input
              type="date"
              id="newStartDate"
              value={newPosition.startDate}
              onChange={(e) => handleNewPositionChange('startDate', e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
          <div className="form-group half-width">
            <label htmlFor="newEndDate">End date</label>
            <input
              type="date"
              id="newEndDate"
              value={newPosition.endDate}
              onChange={(e) => handleNewPositionChange('endDate', e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="newStatus">Status</label>
          <input
            type="text"
            id="newStatus"
            value={newPosition.status}
            onChange={(e) => handleNewPositionChange('status', e.target.value)}
            placeholder="Enter your status"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newResponsibilities">Responsibilities (Optional)</label>
          <textarea
            id="newResponsibilities"
            value={newPosition.responsibilities}
            onChange={(e) => handleNewPositionChange('responsibilities', e.target.value)}
            placeholder="Briefly describe your responsibilities and achievements"
            rows="3"
          ></textarea>
        </div>
        <button onClick={handleAddPositionClick} className="add-another-button">Add another Position</button>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default WorkExperienceForm;