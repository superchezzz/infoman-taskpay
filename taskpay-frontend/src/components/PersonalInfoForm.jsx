import React from 'react';

const PersonalInfoForm = ({ personalInfo, onInputChange, onSaveAndContinue }) => {
  // Don't render the form until the profile data has loaded
  if (!personalInfo) {
    return <div>Loading form...</div>;
  }
  
  return (
    <div className="personal-info-form-content">
      {/* --- NAME FIELDS --- */}
      <div className="form-row">
        <div className="form-group quarter-width">
          <label htmlFor="First_Name">First Name</label>
          <input
            type="text"
            id="First_Name"
            value={personalInfo.First_Name || ''}
            onChange={(e) => onInputChange('First_Name', e.target.value)}
            placeholder="Juan"
          />
        </div>
        <div className="form-group quarter-width">
          <label htmlFor="Middle_Name">Middle Name</label>
          <input
            type="text"
            id="Middle_Name"
            value={personalInfo.Middle_Name || ''}
            onChange={(e) => onInputChange('Middle_Name', e.target.value)}
            placeholder="(Optional)"
          />
        </div>
        <div className="form-group quarter-width">
          <label htmlFor="Surname">Surname</label>
          <input
            type="text"
            id="Surname"
            value={personalInfo.Surname || ''}
            onChange={(e) => onInputChange('Surname', e.target.value)}
            placeholder="Dela Cruz"
          />
        </div>
        <div className="form-group quarter-width">
          <label htmlFor="Suffix">Suffix</label>
          <input
            type="text"
            id="Suffix"
            value={personalInfo.Suffix || ''}
            onChange={(e) => onInputChange('Suffix', e.target.value)}
            placeholder="Jr., III, etc."
          />
        </div>
      </div>

      {/* --- PERSONAL DETAILS --- */}
      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="Sex">Sex</label>
          <select
            id="Sex"
            value={personalInfo.Sex || ''}
            onChange={(e) => onInputChange('Sex', e.target.value)}
          >
            <option value="">Select your sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="form-group half-width">
          <label htmlFor="Civil_Status">Civil Status</label>
          <select
            id="Civil_Status"
            value={personalInfo.Civil_Status || ''}
            onChange={(e) => onInputChange('Civil_Status', e.target.value)}
          >
            <option value="">Select your civil status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="DOB">Date of birth</label>
          <input
            type="date"
            id="DOB"
            // Ensure date is in 'YYYY-MM-DD' format for the input value
            value={personalInfo.DOB ? personalInfo.DOB.split('T')[0] : ''}
            onChange={(e) => onInputChange('DOB', e.target.value)}
          />
        </div>
        <div className="form-group half-width">
          <label htmlFor="Place_of_Birth">Place of birth</label>
          <input
            type="text"
            id="Place_of_Birth"
            value={personalInfo.Place_of_Birth || ''}
            onChange={(e) => onInputChange('Place_of_Birth', e.target.value)}
            placeholder="e.g., Manila"
          />
        </div>
      </div>
      
      {/* --- CONTACT INFO --- */}
       <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="Email">Email</label>
          <input
            type="email"
            id="Email"
            value={(personalInfo.UserAccountDetails?.Email || personalInfo.Email) || ''} // Reads from nested or direct property
            onChange={(e) => onInputChange('Email', e.target.value)}
            placeholder="juan.cruz@example.com"
            readOnly 
          />
        </div>
        <div className="form-group half-width">
          <label htmlFor="Phone_Num">Phone Number</label>
          <input
            type="tel"
            id="Phone_Num"
            value={personalInfo.Phone_Num || ''}
            onChange={(e) => onInputChange('Phone_Num', e.target.value)}
            placeholder="+639171234567"
          />
        </div>
      </div>

      {/* --- ADDRESS FIELDS --- */}
      <div className="form-row">
        <div className="form-group half-width">
            <label htmlFor="House_No">House/Unit No. & Street</label>
            <input
                type="text"
                id="House_No"
                value={personalInfo.House_No || ''}
                onChange={(e) => onInputChange('House_No', e.target.value)}
                placeholder="e.g., 123 Sampaguita St."
            />
        </div>
        <div className="form-group half-width">
            <label htmlFor="Brgy">Barangay</label>
            <input
                type="text"
                id="Brgy"
                value={personalInfo.Brgy || ''}
                onChange={(e) => onInputChange('Brgy', e.target.value)}
                placeholder="e.g., Brgy. San Roque"
            />
        </div>
      </div>
       <div className="form-row">
        <div className="form-group half-width">
            <label htmlFor="City">City / Municipality</label>
            <input
                type="text"
                id="City"
                value={personalInfo.City || ''}
                onChange={(e) => onInputChange('City', e.target.value)}
                placeholder="e.g., Antipolo City"
            />
        </div>
        <div className="form-group half-width">
            <label htmlFor="Province">Province</label>
            <input
                type="text"
                id="Province"
                value={personalInfo.Province || ''}
                onChange={(e) => onInputChange('Province', e.target.value)}
                placeholder="e.g., Rizal"
            />
        </div>
      </div>

      {/* --- OTHER INFO --- */}
      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="Disability">Disability</label>
          <input
            type="text"
            id="Disability"
            value={personalInfo.Disability || ''}
            onChange={(e) => onInputChange('Disability', e.target.value)}
            placeholder="Leave blank if none"
          />
        </div>
        <div className="form-group half-width">
          <label htmlFor="Emp_Status">Employment status</label>
          <select
            id="Emp_Status"
            value={personalInfo.Emp_Status || ''}
            onChange={(e) => onInputChange('Emp_Status', e.target.value)}
          >
            <option value="">Select your employment status</option>
            <option value="Employed">Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Student">Student</option>
            <option value="Self-Employed">Self-Employed</option>
          </select>
        </div>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default PersonalInfoForm;