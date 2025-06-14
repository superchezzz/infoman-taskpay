import React, { useState } from 'react';

const CertificationsForm = ({ certifications, onInputChange, onAddCertification, onRemoveCertification, onSaveAndContinue }) => {
  const [newCertificate, setNewCertificate] = useState({
    Certification_Name: '',
    Issuing_Organization: '',
    Start_Date: '',
    End_Date: '',
    Training_Duration: '',
  });

  const handleNewCertificateChange = (field, value) => {
    setNewCertificate(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCertificateClick = () => {
    if (newCertificate.Certification_Name && newCertificate.Issuing_Organization && newCertificate.Start_Date) {
      onAddCertification(newCertificate);
      // Reset form fields
      setNewCertificate({
        Certification_Name: '',
        Issuing_Organization: '',
        Start_Date: '',
        End_Date: '',
        Training_Duration: '',
      });
    } else {
      alert('Please fill in required fields: Name, Issuing Organization, and Start Date.');
    }
  };

  return (
    <div className="certifications-form-content">
      {certifications && certifications.map((cert, index) => (
        <div key={index} className="certification-entry-card">
          <div className="entry-header">
            <h3>Certification #{index + 1}</h3>
            <button onClick={() => onRemoveCertification(index)} className="remove-button">Remove</button>
          </div>
          <div className="form-group">
            <label>Certificate name</label>
            <input
              type="text"
              value={cert.Certification_Name || ''}
              onChange={(e) => onInputChange(index, 'Certification_Name', e.target.value)}
              placeholder="Certificate title"
            />
          </div>
          <div className="form-group">
            <label>Issuing organization</label>
            <input
              type="text"
              value={cert.Issuing_Organization || ''}
              onChange={(e) => onInputChange(index, 'Issuing_Organization', e.target.value)}
              placeholder="Organization name"
            />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label>Start date</label>
              <input
                type="date"
                value={cert.Start_Date ? cert.Start_Date.split('T')[0] : ''}
                onChange={(e) => onInputChange(index, 'Start_Date', e.target.value)}
              />
            </div>
            <div className="form-group half-width">
              <label>End date (if applicable)</label>
              <input
                type="date"
                value={cert.End_Date ? cert.End_Date.split('T')[0] : ''}
                onChange={(e) => onInputChange(index, 'End_Date', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Training duration</label>
            <input
              type="text"
              value={cert.Training_Duration || ''}
              onChange={(e) => onInputChange(index, 'Training_Duration', e.target.value)}
              placeholder="e.g., 40 hours, 3 months"
            />
          </div>
        </div>
      ))}

      <div className="new-entry-section">
        <h3>Add New Certification</h3>
        {/* Form for adding a new certificate */}
        <div className="form-group">
            <label>Certificate name</label>
            <input
                type="text"
                value={newCertificate.Certification_Name}
                onChange={(e) => handleNewCertificateChange('Certification_Name', e.target.value)}
            />
        </div>
        <div className="form-group">
            <label>Issuing organization</label>
            <input
                type="text"
                value={newCertificate.Issuing_Organization}
                onChange={(e) => handleNewCertificateChange('Issuing_Organization', e.target.value)}
            />
        </div>
        <div className="form-row">
            <div className="form-group half-width">
                <label>Start date</label>
                <input
                type="date"
                value={newCertificate.Start_Date}
                onChange={(e) => handleNewCertificateChange('Start_Date', e.target.value)}
                />
            </div>
            <div className="form-group half-width">
                <label>End date</label>
                <input
                type="date"
                value={newCertificate.End_Date}
                onChange={(e) => handleNewCertificateChange('End_Date', e.target.value)}
                />
            </div>
        </div>
        <div className="form-group">
            <label>Training duration</label>
            <input
                type="text"
                value={newCertificate.Training_Duration}
                onChange={(e) => handleNewCertificateChange('Training_Duration', e.target.value)}
            />
        </div>
        <button onClick={handleAddCertificateClick} className="add-another-button">Add Certification</button>
      </div>

      <button onClick={onSaveAndContinue} className="save-continue-button">Save & Continue</button>
    </div>
  );
};

export default CertificationsForm;