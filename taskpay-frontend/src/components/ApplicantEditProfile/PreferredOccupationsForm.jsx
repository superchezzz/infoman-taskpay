import React from 'react';
import Select from 'react-select';


const portalStyles = {
    menuPortal: base => ({ ...base, zIndex: 9999 }) // Ensure dropdown appears on top of everything
};

const PreferredOccupationsForm = ({ preferences, onPreferenceChange, onSaveAndContinue, allCategories, allLocations }) => {

    // Format the options for react-select: { value, label }
    const categoryOptions = allCategories.map(cat => ({ value: cat.CategoryID, label: cat.CategoryName }));
    const locationOptions = allLocations.map(loc => ({ value: loc.LocationID, label: loc.LocationName }));

    // --- FIX #1: This logic now correctly determines the selected values ---
    // It checks the 'jobCategoryIds' and 'locationIds' that are updated by the onChange handler.
    const selectedCategoryValues = categoryOptions.filter(option =>
        (preferences?.jobCategoryIds || []).includes(option.value)
    );
    const selectedLocationValues = locationOptions.filter(option =>
        (preferences?.locationIds || []).includes(option.value)
    );

    // This handler correctly extracts the IDs and sends them to the parent state
    const handleSelectChange = (selectedOptions, type) => {
        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        if (type === 'category') {
            onPreferenceChange('jobCategoryIds', selectedIds);
        } else if (type === 'location') {
            onPreferenceChange('locationIds', selectedIds);
        }
    };

    return (
        <div className="preferred-occupations-form-content">
            <div className="form-group">
                <label>Job Categories</label>
                <Select
                    isMulti
                    options={categoryOptions}
                    value={selectedCategoryValues}
                    onChange={(selected) => handleSelectChange(selected, 'category')}
                    placeholder="Select job categories..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    // --- FIX #2: Add these props to prevent the menu from being cut off ---
                    menuPortalTarget={document.body}
                    styles={portalStyles}
                />
            </div>

            <div className="form-row">
                <div className="form-group half-width">
                    <label>Expected salary range (Minimum)</label>
                    <input
                        type="number"
                        value={preferences?.Exp_Salary_Min || ''}
                        onChange={(e) => onPreferenceChange('Exp_Salary_Min', e.target.value)}
                        placeholder="Minimum"
                    />
                </div>
                <div className="form-group half-width">
                    <label>Expected salary range (Maximum)</label>
                    <input
                        type="number"
                        value={preferences?.Exp_Salary_Max || ''}
                        onChange={(e) => onPreferenceChange('Exp_Salary_Max', e.target.value)}
                        placeholder="Maximum"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Preferred Locations</label>
                <Select
                    isMulti
                    options={locationOptions}
                    value={selectedLocationValues}
                    onChange={(selected) => handleSelectChange(selected, 'location')}
                    placeholder="Select preferred locations..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    // --- FIX #2: Add these props to prevent the menu from being cut off ---
                    menuPortalTarget={document.body}
                    styles={portalStyles}
                />
            </div>

            <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
        </div>
    );
};

export default PreferredOccupationsForm;