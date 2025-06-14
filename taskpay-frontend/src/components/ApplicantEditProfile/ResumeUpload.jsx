import React, { useRef } from 'react';

const ResumeUpload = ({ resumeFile, onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      validateAndUploadFile(file);
    }
  };

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      validateAndUploadFile(file);
    }
  };

  const validateAndUploadFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    if (file.size > maxSizeBytes) {
      alert('File size exceeds the limit of 5MB.');
      return;
    }

    onFileUpload(file);
  };

  return (
    <div className="resume-upload-content">
      <div
        className="resume-upload-box"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        {/* You can replace this with an actual SVG icon */}
        <p className="upload-icon-placeholder">+</p>
        <p>Drag & drop your resume here or</p>
        <button type="button" className="browse-files-button">Browse Files</button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx"
        />
      </div>
      {resumeFile && (
        <div className="uploaded-file-info">
          <p>Uploaded file: <strong>{resumeFile.name}</strong> ({Math.round(resumeFile.size / 1024)} KB)</p>
          {/* You might want a "Remove" or "Replace" button here */}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;