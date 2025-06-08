import React from 'react';

function TaskHistoryItem({ task, onView }) {
  return (
    <div className="task-history-item">
      <h4>{task.title}</h4>
      <p>{task.category} | {task.location}</p>
      <p>P{task.budget} | Completed: {task.completedDate}</p>
      <p>Client: {task.client}</p>
      <button onClick={() => onView(task)}>View</button>
      {task.status === 'Completed' && <span className="completed-tag">Completed</span>}
    </div>
  );
}

export default TaskHistoryItem;