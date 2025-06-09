// taskpay-frontend/src/components/TaskHistoryItem.jsx
import React from 'react';

function TaskHistoryItem({ task, onView }) {
  // Helper to format dates nicely, handles null dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
  };

  // Helper to get client initials (reused from AvailableTaskItem)
  const getClientInitials = (clientName) => {
    if (!clientName) return '??';
    const parts = clientName.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // The completion date is based on when the application status changed (updatedAt)
  // For 'Completed' status, use 'updatedAt'
  // For 'Rejected'/'Withdrawn', use 'ApplicationDate' if more appropriate for display, or still 'updatedAt'
  const displayDate = task.Status === 'Completed'
                      ? `Completed: ${formatDate(task.updatedAt)}`
                      : (task.Status === 'Rejected' || task.Status === 'Withdrawn' || task.Status === 'Cancelled')
                        ? `Date: ${formatDate(task.ApplicationDate)}` // Show when it happened
                        : `Due: ${formatDate(task.TaskDetails?.Deadline)}`; // Fallback, though history should have a final state

  return (
    <div className="available-task-card task-history-item-override"> {/* Added task-history-item-override for specific adjustments */}
      <div className="task-header-row">
        <h4 className="task-title">{task.TaskDetails?.Title || 'Untitled Task'}</h4>
        <div className="client-info">
          Client: <span className="client-initials">{getClientInitials(task.TaskDetails?.ClientName)}</span>
        </div>
      </div>

      <div className="task-details-row">
        {/* Using the same icon classes as AvailableTaskItem */}
        <span className="detail-item"><i className="icon-graphic-design"></i> {task.TaskDetails?.Category || 'No Category'}</span>
        <span className="detail-item"><i className="icon-location"></i> {task.TaskDetails?.Location || 'No Location'}</span>
        <span className="detail-item"><i className="icon-budget"></i> P{task.TaskDetails?.Budget || 0}</span>
        <span className="detail-item"><i className="icon-calendar"></i> {displayDate}</span> {/* Dynamic date display */}
      </div>

      <p className="task-description">{task.TaskDetails?.Description || 'No description provided.'}</p>

      <div className="task-actions">
        <button onClick={() => onView(task)} className="view-button">View</button>
        {/* History specific status tag */}
        {task.Status && <span className={`history-status-tag status-${task.Status.toLowerCase().replace(/\s/g, '')}`}>{task.Status}</span>}
      </div>
    </div>
  );
}

export default TaskHistoryItem;