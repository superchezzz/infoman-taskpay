import React from "react";
import "./taskApplicationStatus.css";

export const taskApplicationStatus = ({
  jobTitle,
  applicationDate,
  salary,
  clientName,
  applicationStatus,
}) => {
  const getStatusPillClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-pill status-pending";
      case "approved":
        return "status-pill status-approved";
      case "in progress":
        return "status-pill status-in-progress";
      case "completed":
        return "status-pill status-completed";
      default:
        return "status-pill";
    }
  };

  const renderActionButtons = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <>
            <button className="card-button view-button">View</button>
            <button className="card-button withdraw-button">Withdraw</button>
          </>
        );
      case "approved":
        return (
          <>
            <button className="card-button view-button">View</button>
            <button className="card-button start-task-button">Start Task</button>
          </>
        );
      case "in progress":
        return (
          <>
            <button className="card-button view-button">View</button>
            <button className="card-button update-progress-button">Update Progress</button>
          </>
        );
      case "completed":
        return (
          <>
            <button className="card-button view-button">View</button>
            <button className="card-button complete-button">Complete</button>
          </>
        );
      default:
        return <button className="card-button view-button">View</button>;
    }
  };

  return (
    <div className="task-application-status-card">
      <div className="card-header">
        <h3 className="job-title">{jobTitle}</h3>
        <span className={getStatusPillClass(applicationStatus)}>
          {applicationStatus}
        </span>
      </div>

      <div className="card-details">
        <p className="details-text">
          Applied: {applicationDate} • Budget: ₱{salary}
        </p>
        <p className="details-text">Client: {clientName}</p>
      </div>

      <div className="card-actions">
        {renderActionButtons(applicationStatus)}
      </div>
    </div>
  );
};

export default taskApplicationStatus;