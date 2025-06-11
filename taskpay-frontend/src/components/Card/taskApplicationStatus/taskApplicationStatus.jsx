import React from 'react';
import './taskApplicationStatus.css';

// Note: It's a React convention to name components with PascalCase (e.g., TaskApplicationStatus)
// but we will stick to your original naming to avoid breaking imports.
const taskApplicationStatus = ({ application, onView }) => {
  // Props are now the entire 'application' object and the 'onView' function

  // Helper function to get a CSS class from the status string
  const getStatusPillClass = (status) => {
    const statusClass = status ? status.toLowerCase().replace(/\s+/g, '-') : 'unknown';
    return `status-pill status-${statusClass}`;
  };

  return (
    <div className="task-application-status-card">
      <div className="card-header">
        <h3 className="job-title">{application.TaskDetails?.Title || 'N/A'}</h3>
        {/* The status pill is now the primary status indicator */}
        <span className={getStatusPillClass(application.Status)}>
          {application.Status || 'Unknown'}
        </span>
      </div>

      <div className="card-details">
        <p className="details-text">
          Applied: {new Date(application.ApplicationDate).toLocaleDateString()} • Budget: ₱{application.TaskDetails?.Budget || '0.00'}
        </p>
        <p className="details-text">Client: {application.TaskDetails?.ClientName || 'N/A'}</p>
      </div>

      <div className="card-actions">
        {/* We now only have one button, and it gets its action from the 'onView' prop */}
        <button className="card-button view-button" onClick={onView}>
          View
        </button>
      </div>
    </div>
  );
};

export default taskApplicationStatus;