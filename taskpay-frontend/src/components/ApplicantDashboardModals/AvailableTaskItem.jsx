// taskpay-frontend/src/components/AvailableTaskItem.jsx
import React from 'react';
import { getClientInitials } from "../../utils/formatName.js";

function AvailableTaskItem({ task, onView, onApply }) {
  // Helper to format dates nicely, handles null dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Using 'en-US' and specifying options for a more consistent date output
    // You might adjust this based on your preferred date format (e.g., 'MM/DD/YYYY')
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
  };

  return (
    <div className="available-task-card">
      <div className="task-header-row">
        <h4 className="task-title">{task.Title || 'Untitled Task'}</h4>
        <div className="client-info">
          Client: <span className="client-initials">{getClientInitials(task.ClientName)}</span>
        </div>
      </div>

      <div className="task-details-row">
        {/* CORRECTED: Put the specific icon classes back */}
        <span className="detail-item"><i className="icon-graphic-design"></i> {task.Category || 'No Category'}</span>
        <span className="detail-item"><i className="icon-location"></i> {task.Location || 'No Location'}</span>
        <span className="detail-item"><i className="icon-budget"></i> P{task.Budget || 0}</span>
        <span className="detail-item"><i className="icon-calendar"></i> Due: {formatDate(task.Deadline)}</span>
      </div>

      <p className="task-description">{task.Description || 'No description provided.'}</p>

      <div className="task-actions">
        <button onClick={() => onView(task)} className="view-button">View</button>
        <button onClick={() => onApply(task)} className="apply-button">Apply</button>
      </div>
    </div>
  );
}

export default AvailableTaskItem;