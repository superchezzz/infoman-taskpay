// taskpay-frontend/src/components/PersonalInfoForm.jsx
import React from 'react';

const PersonalInfoForm = ({ personalInfo, onInputChange, onSaveAndContinue }) => {
  return (
    <div className="personal-info-form-content">
      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={personalInfo.fullName}
            onChange={(e) => onInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        <div className="form-group half-width">
          <label htmlFor="sex">Sex</label>
          <select
            id="sex"
            value={personalInfo.sex}
            onChange={(e) => onInputChange('sex', e.target.value)}
          >
            <option value="">Select your sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="civilStatus">Civil Status</label>
          <select
            id="civilStatus"
            value={personalInfo.civilStatus}
            onChange={(e) => onInputChange('civilStatus', e.target.value)}
          >
            <option value="">Select your civil status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
        <div className="form-group half-width">
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input
            type="date"
            id="dateOfBirth"
            value={personalInfo.dateOfBirth}
            onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
            placeholder="DD/MM/YYYY"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="placeOfBirth">Place of birth</label>
          <input
            type="text"
            id="placeOfBirth"
            value={personalInfo.placeOfBirth}
            onChange={(e) => onInputChange('placeOfBirth', e.target.value)}
            placeholder="Enter your place of birth"
          />
        </div>
        <div className="form-group half-width">
          <label htmlFor="disability">Disability</label>
          <input
            type="text"
            id="disability"
            value={personalInfo.disability}
            onChange={(e) => onInputChange('disability', e.target.value)}
            placeholder="Enter your disability if any"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="employmentStatus">Employment status</label>
          <select
            id="employmentStatus"
            value={personalInfo.employmentStatus}
            onChange={(e) => onInputChange('employmentStatus', e.target.value)}
          >
            <option value="">Enter your employment status</option>
            <option value="Employed">Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Student">Student</option>
            <option value="Self-Employed">Self-Employed</option>
          </select>
        </div>
        <div className="form-group half-width">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={personalInfo.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="john.doe@example.com"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            value={personalInfo.phoneNumber}
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            placeholder="+639 (xxx) xxx-xxxx"
          />
        </div>
        <div className="form-group half-width">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={personalInfo.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="Enter your full address"
          />
        </div>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default PersonalInfoForm;