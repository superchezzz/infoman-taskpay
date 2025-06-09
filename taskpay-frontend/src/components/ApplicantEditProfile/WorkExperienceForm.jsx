import React, { useState } from 'react';

const WorkExperienceForm = ({ workExperience, onInputChange, onAddWorkExperience, onRemoveWorkExperience, onSaveAndContinue }) => {
  // Local state for the "Add New" form, using backend field names
  const [newPosition, setNewPosition] = useState({
    Position: '',
    Cmp_Name: '',
    Start_Date: '',
    End_Date: '',
    Status: '',
    Responsibilities: '',
  });

  const handleNewPositionChange = (field, value) => {
    setNewPosition(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPositionClick = () => {
    if (newPosition.Position && newPosition.Cmp_Name && newPosition.Start_Date) {
      onAddWorkExperience(newPosition);
      // Reset form fields
      setNewPosition({
        Position: '',
        Cmp_Name: '',
        Start_Date: '',
        End_Date: '',
        Status: '',
        Responsibilities: '',
      });
    } else {
      alert('Please fill in required fields: Job Title, Company, and Start Date.');
    }
  };

  return (
    <div className="work-experience-form-content">
      {workExperience && workExperience.map((job, index) => (
        <div key={index} className="work-experience-entry-card">
          <div className="entry-header">
            <h3>Work Experience #{index + 1}</h3>
            <button onClick={() => onRemoveWorkExperience(index)} className="remove-button">Remove</button>
          </div>
          <div className="form-group">
            <label>Job title</label>
            <input
              type="text"
              value={job.Position || ''}
              onChange={(e) => onInputChange(index, 'Position', e.target.value)}
              placeholder="Your position"
            />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={job.Cmp_Name || ''}
              onChange={(e) => onInputChange(index, 'Cmp_Name', e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label>Start date</label>
              <input
                type="date"
                value={job.Start_Date ? job.Start_Date.split('T')[0] : ''}
                onChange={(e) => onInputChange(index, 'Start_Date', e.target.value)}
              />
            </div>
            <div className="form-group half-width">
              <label>End date</label>
              <input
                type="date"
                value={job.End_Date ? job.End_Date.split('T')[0] : ''}
                onChange={(e) => onInputChange(index, 'End_Date', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <input
              type="text"
              value={job.Status || ''}
              onChange={(e) => onInputChange(index, 'Status', e.target.value)}
              placeholder="e.g., Full-Time, Contract"
            />
          </div>
          <div className="form-group">
            <label>Responsibilities (Optional)</label>
            <textarea
              value={job.Responsibilities || ''}
              onChange={(e) => onInputChange(index, 'Responsibilities', e.target.value)}
              placeholder="Briefly describe your responsibilities and achievements"
              rows="3"
            ></textarea>
          </div>
        </div>
      ))}

      <div className="new-entry-section">
        <h3>Add New Work Experience</h3>
        {/* Form for adding a new position */}
        <div className="form-group">
          <label>Job title</label>
          <input
            type="text"
            value={newPosition.Position}
            onChange={(e) => handleNewPositionChange('Position', e.target.value)}
          />
        </div>
         <div className="form-group">
          <label>Company</label>
          <input
            type="text"
            value={newPosition.Cmp_Name}
            onChange={(e) => handleNewPositionChange('Cmp_Name', e.target.value)}
          />
        </div>
        <div className="form-row">
            <div className="form-group half-width">
                <label>Start date</label>
                <input
                type="date"
                value={newPosition.Start_Date}
                onChange={(e) => handleNewPositionChange('Start_Date', e.target.value)}
                />
            </div>
            <div className="form-group half-width">
                <label>End date</label>
                <input
                type="date"
                value={newPosition.End_Date}
                onChange={(e) => handleNewPositionChange('End_Date', e.target.value)}
                />
            </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <input
            type="text"
            value={newPosition.Status}
            onChange={(e) => handleNewPositionChange('Status', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Responsibilities</label>
          <textarea
            value={newPosition.Responsibilities}
            onChange={(e) => handleNewPositionChange('Responsibilities', e.target.value)}
            rows="3"
          ></textarea>
        </div>
        <button onClick={handleAddPositionClick} className="add-another-button">Add Work Experience</button>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default WorkExperienceForm;