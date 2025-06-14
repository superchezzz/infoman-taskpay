import React from 'react';
import './taskApplicationStatus.css';

const taskApplicationStatus = ({ application, onView }) => {
  const getStatusPillClass = (status) => {
    const statusClass = status ? status.toLowerCase().replace(/\s+/g, '-') : 'unknown';
    return `status-pill status-${statusClass}`;
  };

  return (
    <div className="task-application-status-card">
      <div className="card-header">
        <h3 className="job-title">{application.TaskDetails?.Title || 'N/A'}</h3>
        <span className={getStatusPillClass(application.Status)}>
          {application.Status === 'InProgress' ? 'In Progress' : application.Status || 'Unknown'}
        </span>
      </div>

      <div className="card-details">
        <p className="details-text">
          Applied: {new Date(application.ApplicationDate).toLocaleDateString()} • Budget: ₱{application.TaskDetails?.Budget || '0.00'}
        </p>
        <p className="details-text">Client: {application.TaskDetails?.ClientName || 'N/A'}</p>
      </div>

      <div className="card-actions">
        <button className="card-button view-button" onClick={onView}>
          View
        </button>
      </div>
    </div>
  );
};

export default taskApplicationStatus;