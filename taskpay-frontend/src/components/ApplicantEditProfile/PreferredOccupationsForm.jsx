import React, { useState, useMemo } from 'react';

const PreferredOccupationsForm = ({ preferences, onPreferenceChange, onSaveAndContinue }) => {
  const [newJobCategory, setNewJobCategory] = useState('');
  const [newPreferredLocation, setNewPreferredLocation] = useState('');

  // Use useMemo to safely parse the categories and locations once
  const jobCategories = useMemo(() => {
    // Assumes categories are stored as a comma-separated string in the database
    if (preferences?.Pref_Job_Categories) {
      return preferences.Pref_Job_Categories.split(',').filter(c => c);
    }
    return [];
  }, [preferences]);

  const preferredLocations = useMemo(() => {
    if (preferences?.Pref_Locations) {
      return preferences.Pref_Locations.split(',').filter(l => l);
    }
    return [];
  }, [preferences]);


  const handleAddTag = (type) => {
    if (type === 'category' && newJobCategory && !jobCategories.includes(newJobCategory)) {
      const newArray = [...jobCategories, newJobCategory];
      onPreferenceChange('Pref_Job_Categories', newArray.join(','));
      setNewJobCategory('');
    } else if (type === 'location' && newPreferredLocation && !preferredLocations.includes(newPreferredLocation)) {
      const newArray = [...preferredLocations, newPreferredLocation];
      onPreferenceChange('Pref_Locations', newArray.join(','));
      setNewPreferredLocation('');
    }
  };

  const handleRemoveTag = (type, tagToRemove) => {
    if (type === 'category') {
      const newArray = jobCategories.filter(tag => tag !== tagToRemove);
      onPreferenceChange('Pref_Job_Categories', newArray.join(','));
    } else if (type === 'location') {
      const newArray = preferredLocations.filter(tag => tag !== tagToRemove);
      onPreferenceChange('Pref_Locations', newArray.join(','));
    }
  };

  return (
    <div className="preferred-occupations-form-content">
      <div className="form-group">
        <label>Job Categories</label>
        <div className="tags-container">
          {jobCategories.map((category, index) => (
            <span key={index} className="tag">
              {category}
              <button type="button" onClick={() => handleRemoveTag('category', category)}>X</button>
            </span>
          ))}
          <input
            type="text"
            value={newJobCategory}
            onChange={(e) => setNewJobCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('category'))}
            placeholder="Type and press Enter or Add"
          />
          <button type="button" onClick={() => handleAddTag('category')}>Add</button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label>Expected salary range (Minimum)</label>
          <input
            type="number"
            value={preferences?.Expected_Salary_Min || ''}
            onChange={(e) => onPreferenceChange('Expected_Salary_Min', e.target.value)}
            placeholder="Minimum"
          />
        </div>
        <div className="form-group half-width">
          <label>Expected salary range (Maximum)</label>
          <input
            type="number"
            value={preferences?.Expected_Salary_Max || ''}
            onChange={(e) => onPreferenceChange('Expected_Salary_Max', e.target.value)}
            placeholder="Maximum"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Preferred Locations</label>
        <div className="tags-container">
          {preferredLocations.map((location, index) => (
            <span key={index} className="tag">
              {location}
              <button type="button" onClick={() => handleRemoveTag('location', location)}>X</button>
            </span>
          ))}
          <input
            type="text"
            value={newPreferredLocation}
            onChange={(e) => setNewPreferredLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('location'))}
            placeholder="Type and press Enter or Add"
          />
          <button type="button" onClick={() => handleAddTag('location')}>Add</button>
        </div>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default PreferredOccupationsForm;