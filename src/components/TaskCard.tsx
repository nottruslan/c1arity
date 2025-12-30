import type { Task } from '../types/task';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onToggleStatus: () => void;
}

export function TaskCard({ task, onClick, onToggleStatus }: TaskCardProps) {
  const priorityColors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}
      onClick={onClick}
    >
      <div className="task-card-header">
        <div
          className="task-checkbox"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus();
          }}
        >
          {task.status === 'completed' && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M16.6667 5L7.50004 14.1667L3.33337 10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div className="task-card-content">
          <h3 className="task-title">{task.title}</h3>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
        </div>
      </div>
      <div className="task-card-footer">
        {task.deadline && (
          <span className={`task-deadline ${task.status === 'completed' ? 'completed' : ''}`}>
            {formatDate(task.deadline)}
          </span>
        )}
        <span
          className="task-priority"
          style={{ color: priorityColors[task.priority] }}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>
    </div>
  );
}

