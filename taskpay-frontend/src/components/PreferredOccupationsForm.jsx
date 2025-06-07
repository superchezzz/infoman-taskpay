// taskpay-frontend/src/components/PreferredOccupationsForm.jsx
import React, { useState } from 'react';

const PreferredOccupationsForm = ({
  preferredOccupations,
  onInputChange,
  onAddJobCategory,
  onRemoveJobCategory,
  onAddPreferredLocation,
  onRemovePreferredLocation,
  onSaveAndContinue
}) => {
  const [newJobCategory, setNewJobCategory] = useState('');
  const [newPreferredLocation, setNewPreferredLocation] = useState('');

  const handleJobCategoryAdd = () => {
    if (newJobCategory && !preferredOccupations.jobCategories.includes(newJobCategory)) {
      onAddJobCategory(newJobCategory);
      setNewJobCategory('');
    }
  };

  const handleLocationAdd = () => {
    if (newPreferredLocation && !preferredOccupations.preferredLocations.includes(newPreferredLocation)) {
      onAddPreferredLocation(newPreferredLocation);
      setNewPreferredLocation('');
    }
  };

  return (
    <div className="preferred-occupations-form-content">
      <div className="form-group">
        <label htmlFor="jobCategories">Job Categories</label>
        <div className="tags-container">
          {preferredOccupations.jobCategories.map((category, index) => (
            <span key={index} className="tag">
              {category}
              <button type="button" onClick={() => onRemoveJobCategory(category)}>X</button>
            </span>
          ))}
          <input
            type="text"
            id="jobCategories"
            value={newJobCategory}
            onChange={(e) => setNewJobCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                handleJobCategoryAdd();
              }
            }}
            placeholder="Select job category or type to add"
          />
          <button type="button" onClick={handleJobCategoryAdd}>Add</button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="expectedSalaryMin">Expected salary range (Minimum)</label>
          <input
            type="number"
            id="expectedSalaryMin"
            value={preferredOccupations.expectedSalaryRange.min}
            onChange={(e) => onInputChange('expectedSalaryRange', { ...preferredOccupations.expectedSalaryRange, min: e.target.value })}
            placeholder="Minimum"
          />
        </div>
        <div className="form-group half-width">
          <label htmlFor="expectedSalaryMax">Expected salary range (Maximum)</label>
          <input
            type="number"
            id="expectedSalaryMax"
            value={preferredOccupations.expectedSalaryRange.max}
            onChange={(e) => onInputChange('expectedSalaryRange', { ...preferredOccupations.expectedSalaryRange, max: e.target.value })}
            placeholder="Maximum"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="preferredLocations">Preferred Locations</label>
        <div className="tags-container">
          {preferredOccupations.preferredLocations.map((location, index) => (
            <span key={index} className="tag">
              {location}
              <button type="button" onClick={() => onRemovePreferredLocation(location)}>X</button>
            </span>
          ))}
          <input
            type="text"
            id="preferredLocations"
            value={newPreferredLocation}
            onChange={(e) => setNewPreferredLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                handleLocationAdd();
              }
            }}
            placeholder="Enter place or regions"
          />
          <button type="button" onClick={handleLocationAdd}>Add</button>
        </div>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default PreferredOccupationsForm;