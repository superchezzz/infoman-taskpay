// taskpay-frontend/src/components/EducationalBackgroundForm.jsx
import React, { useState } from 'react';

const EducationalBackgroundForm = ({ educationalBackground, onInputChange, onAddEducation, onSaveAndContinue }) => {
  const [newEducation, setNewEducation] = useState({
    educationalAttainment: '',
    institution: '',
    course: '',
    graduationYear: '',
    award: '',
  });

  const handleNewEducationChange = (field, value) => {
    setNewEducation(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEducationClick = () => {
    if (newEducation.educationalAttainment && newEducation.institution && newEducation.graduationYear) {
      onAddEducation(newEducation);
      setNewEducation({ // Reset form fields
        educationalAttainment: '',
        institution: '',
        course: '',
        graduationYear: '',
        award: '',
      });
    } else {
      alert('Please fill in required fields for education: Attainment, Institution, and Graduation Year.');
    }
  };

  return (
    <div className="educational-background-form-content">
      {educationalBackground.map((edu, index) => (
        <div key={index} className="education-entry-card">
          <h3>Education Entry #{index + 1}</h3>
          <div className="form-group">
            <label htmlFor={`eduAttainment-${index}`}>Educational Attainment</label>
            <input
              type="text"
              id={`eduAttainment-${index}`}
              value={edu.educationalAttainment}
              onChange={(e) => onInputChange(index, 'educationalAttainment', e.target.value)}
              placeholder="Select degree"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`institution-${index}`}>Institution</label>
            <input
              type="text"
              id={`institution-${index}`}
              value={edu.institution}
              onChange={(e) => onInputChange(index, 'institution', e.target.value)}
              placeholder="Enter institution"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`course-${index}`}>Course</label>
            <input
              type="text"
              id={`course-${index}`}
              value={edu.course}
              onChange={(e) => onInputChange(index, 'course', e.target.value)}
              placeholder="Name of course"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`gradYear-${index}`}>Graduation Year</label>
            <input
              type="text"
              id={`gradYear-${index}`}
              value={edu.graduationYear}
              onChange={(e) => onInputChange(index, 'graduationYear', e.target.value)}
              placeholder="YYYY"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`award-${index}`}>Award</label>
            <input
              type="text"
              id={`award-${index}`}
              value={edu.award}
              onChange={(e) => onInputChange(index, 'award', e.target.value)}
              placeholder="Add other award"
            />
          </div>
          {/* You might want a "Remove" button here for existing entries */}
        </div>
      ))}

      <div className="new-entry-section">
        <h3>Add New Educational Background</h3>
        <div className="form-group">
          <label htmlFor="newEducationalAttainment">Educational Attainment</label>
          <input
            type="text"
            id="newEducationalAttainment"
            value={newEducation.educationalAttainment}
            onChange={(e) => handleNewEducationChange('educationalAttainment', e.target.value)}
            placeholder="Select degree"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newInstitution">Institution</label>
          <input
            type="text"
            id="newInstitution"
            value={newEducation.institution}
            onChange={(e) => handleNewEducationChange('institution', e.target.value)}
            placeholder="Enter institution"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newCourse">Course</label>
          <input
            type="text"
            id="newCourse"
            value={newEducation.course}
            onChange={(e) => handleNewEducationChange('course', e.target.value)}
            placeholder="Name of course"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newGraduationYear">Graduation Year</label>
          <input
            type="text"
            id="newGraduationYear"
            value={newEducation.graduationYear}
            onChange={(e) => handleNewEducationChange('graduationYear', e.target.value)}
            placeholder="YYYY"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newAward">Award</label>
          <input
            type="text"
            id="newAward"
            value={newEducation.award}
            onChange={(e) => handleNewEducationChange('award', e.target.value)}
            placeholder="Add other award"
          />
        </div>
        <button onClick={handleAddEducationClick} className="add-another-button">Add another award</button>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default EducationalBackgroundForm;