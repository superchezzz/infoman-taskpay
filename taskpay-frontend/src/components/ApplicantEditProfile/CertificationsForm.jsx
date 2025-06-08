// taskpay-frontend/src/components/CertificationsForm.jsx
import React, { useState } from 'react';

const CertificationsForm = ({ certifications, onInputChange, onAddCertification, onSaveAndContinue }) => {
  const [newCertificate, setNewCertificate] = useState({
    certificateName: '',
    issuingOrganization: '',
    startDate: '',
    endDate: '', // Can be empty if no expiration
    trainingDuration: '',
  });

  const handleNewCertificateChange = (field, value) => {
    setNewCertificate(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCertificateClick = () => {
    if (newCertificate.certificateName && newCertificate.issuingOrganization && newCertificate.startDate) {
      onAddCertification(newCertificate);
      setNewCertificate({ // Reset form fields
        certificateName: '',
        issuingOrganization: '',
        startDate: '',
        endDate: '',
        trainingDuration: '',
      });
    } else {
      alert('Please fill in required fields for certification: Name, Issuing Organization, and Start Date.');
    }
  };

  return (
    <div className="certifications-form-content">
      {certifications.map((cert, index) => (
        <div key={index} className="certification-entry-card">
          <h3>Certification #{index + 1}</h3>
          <div className="form-group">
            <label htmlFor={`certName-${index}`}>Certificate name</label>
            <input
              type="text"
              id={`certName-${index}`}
              value={cert.certificateName}
              onChange={(e) => onInputChange(index, 'certificateName', e.target.value)}
              placeholder="Certificate title"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`issuingOrg-${index}`}>Issuing organization</label>
            <input
              type="text"
              id={`issuingOrg-${index}`}
              value={cert.issuingOrganization}
              onChange={(e) => onInputChange(index, 'issuingOrganization', e.target.value)}
              placeholder="Organization name"
            />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor={`certStartDate-${index}`}>Start date</label>
              <input
                type="date"
                id={`certStartDate-${index}`}
                value={cert.startDate}
                onChange={(e) => onInputChange(index, 'startDate', e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor={`certEndDate-${index}`}>End date</label>
              <input
                type="date"
                id={`certEndDate-${index}`}
                value={cert.endDate}
                onChange={(e) => onInputChange(index, 'endDate', e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor={`trainingDuration-${index}`}>Training duration</label>
            <input
              type="text"
              id={`trainingDuration-${index}`}
              value={cert.trainingDuration}
              onChange={(e) => onInputChange(index, 'trainingDuration', e.target.value)}
              placeholder="Enter your training duration"
            />
          </div>
          {/* You might want a "Remove" button here for existing entries */}
        </div>
      ))}

      <div className="new-entry-section">
        <h3>Add New Certification</h3>
        <div className="form-group">
          <label htmlFor="newCertificateName">Certificate name</label>
          <input
            type="text"
            id="newCertificateName"
            value={newCertificate.certificateName}
            onChange={(e) => handleNewCertificateChange('certificateName', e.target.value)}
            placeholder="Certificate title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newIssuingOrganization">Issuing organization</label>
          <input
            type="text"
            id="newIssuingOrganization"
            value={newCertificate.issuingOrganization}
            onChange={(e) => handleNewCertificateChange('issuingOrganization', e.target.value)}
            placeholder="Organization name"
          />
        </div>
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="newCertStartDate">Start date</label>
            <input
              type="date"
              id="newCertStartDate"
              value={newCertificate.startDate}
              onChange={(e) => handleNewCertificateChange('startDate', e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
          <div className="form-group half-width">
            <label htmlFor="newCertEndDate">End date</label>
            <input
              type="date"
              id="newCertEndDate"
              value={newCertificate.endDate}
              onChange={(e) => handleNewCertificateChange('endDate', e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="newTrainingDuration">Training duration</label>
          <input
            type="text"
            id="newTrainingDuration"
            value={newCertificate.trainingDuration}
            onChange={(e) => handleNewCertificateChange('trainingDuration', e.target.value)}
            placeholder="Enter your training duration"
          />
        </div>
        <button onClick={handleAddCertificateClick} className="add-another-button">Add another Certification</button>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default CertificationsForm;