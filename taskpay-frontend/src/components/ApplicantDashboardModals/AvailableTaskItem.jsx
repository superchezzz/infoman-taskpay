import React from 'react';

function AvailableTaskItem({ task, onView, onApply }) {
  return (
    <div className="available-task-card">
      <h4>{task.title}</h4>
      <p>{task.category} | {task.location}</p>
      <p>P{task.budget} | Due: {task.dueDate}</p>
      <p>Client: {task.client}</p>
      <div className="task-actions">
        <button onClick={() => onView(task)}>View</button>
        <button onClick={() => onApply(task)} className="apply-button">Apply</button>
      </div>
    </div>
  );
}

export default AvailableTaskItem;