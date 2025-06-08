import React, { useState, useEffect } from 'react';

function DocumentsForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="my-documents-form">
      <div>
        <label htmlFor="tinNumber">TIN Number</label>
        <input
          type="text"
          id="tinNumber"
          name="tinNumber"
          value={formData.tinNumber}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="sssNumber">SSS Number</label>
        <input
          type="text"
          id="sssNumber"
          name="sssNumber"
          value={formData.sssNumber}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="philhealthNumber">Philhealth Number</label>
        <input
          type="text"
          id="philhealthNumber"
          name="philhealthNumber"
          value={formData.philhealthNumber}
          onChange={handleChange}
        />
      </div>
      <div className="modal-actions">
        <button className="cancel-button" onClick={onCancel}>Cancel</button>
        <button className="update-documents-button" onClick={handleSubmit}>Update Documents</button>
      </div>
    </div>
  );
}

export default DocumentsForm;