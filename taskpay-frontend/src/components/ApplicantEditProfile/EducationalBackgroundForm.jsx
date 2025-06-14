import React, { useState } from 'react';

const EducationalBackgroundForm = ({ educationalBackground, onInputChange, onAddEducation, onRemoveEducation, onSaveAndContinue }) => {
  const [newEducation, setNewEducation] = useState({
    Educational_Attainment: '',
    Institution: '',
    Course: '',
    Graduation_Year: '',
    Award: '',
  });

  const handleNewEducationChange = (field, value) => {
    setNewEducation(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEducationClick = () => {
    // Basic validation
    if (newEducation.Educational_Attainment && newEducation.Institution && newEducation.Graduation_Year) {
      onAddEducation(newEducation);
      // Reset form fields
      setNewEducation({
        Educational_Attainment: '',
        Institution: '',
        Course: '',
        Graduation_Year: '',
        Award: '',
      });
    } else {
      alert('Please fill in required fields: Attainment, Institution, and Graduation Year.');
    }
  };

  return (
    <div className="educational-background-form-content">
      {/* This maps over the existing education entries from the database */}
      {educationalBackground && educationalBackground.map((edu, index) => (
        <div key={index} className="education-entry-card">
          <div className="entry-header">
            <h3>Education Entry #{index + 1}</h3>
            <button onClick={() => onRemoveEducation(index)} className="remove-button">Remove</button>
          </div>
          <div className="form-group">
            <label>Educational Attainment</label>
            <input
              type="text"
              value={edu.Educational_Attainment || ''}
              onChange={(e) => onInputChange(index, 'Educational_Attainment', e.target.value)}
              placeholder="e.g., Bachelor's Degree"
            />
          </div>
          <div className="form-group">
            <label>Institution</label>
            <input
              type="text"
              value={edu.Institution || ''}
              onChange={(e) => onInputChange(index, 'Institution', e.target.value)}
              placeholder="e.g., University of the Philippines"
            />
          </div>
          <div className="form-group">
            <label>Course</label>
            <input
              type="text"
              value={edu.Course || ''}
              onChange={(e) => onInputChange(index, 'Course', e.target.value)}
              placeholder="e.g., BS in Computer Science"
            />
          </div>
          <div className="form-group">
            <label>Graduation Year</label>
            <input
              type="text"
              value={edu.Graduation_Year || ''}
              onChange={(e) => onInputChange(index, 'Graduation_Year', e.target.value)}
              placeholder="YYYY"
            />
          </div>
          <div className="form-group">
            <label>Award</label>
            <input
              type="text"
              value={edu.Award || ''}
              onChange={(e) => onInputChange(index, 'Award', e.target.value)}
              placeholder="e.g., Cum Laude (Optional)"
            />
          </div>
        </div>
      ))}

      <div className="new-entry-section">
        <h3>Add New Educational Background</h3>
        <div className="form-group">
          <label>Educational Attainment</label>
          <input
            type="text"
            value={newEducation.Educational_Attainment}
            onChange={(e) => handleNewEducationChange('Educational_Attainment', e.target.value)}
            placeholder="Select degree"
          />
        </div>
        {/* ... other input fields for new entry ... */}
         <div className="form-group">
          <label>Institution</label>
          <input
            type="text"
            value={newEducation.Institution}
            onChange={(e) => handleNewEducationChange('Institution', e.target.value)}
            placeholder="Enter institution"
          />
        </div>
        <div className="form-group">
          <label>Course</label>
          <input
            type="text"
            value={newEducation.Course}
            onChange={(e) => handleNewEducationChange('Course', e.target.value)}
            placeholder="Name of course"
          />
        </div>
        <div className="form-group">
          <label>Graduation Year</label>
          <input
            type="text"
            value={newEducation.Graduation_Year}
            onChange={(e) => handleNewEducationChange('Graduation_Year', e.target.value)}
            placeholder="YYYY"
          />
        </div>
        <div className="form-group">
          <label>Award</label>
          <input
            type="text"
            value={newEducation.Award}
            onChange={(e) => handleNewEducationChange('Award', e.target.value)}
            placeholder="Add other award"
          />
        </div>
        <button onClick={handleAddEducationClick} className="add-another-button">Add Education</button>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default EducationalBackgroundForm;