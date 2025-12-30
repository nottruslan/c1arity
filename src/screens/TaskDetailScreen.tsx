import { useTasks } from '../hooks/useTasks';
import './TaskDetailScreen.css';

interface TaskDetailScreenProps {
  taskId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function TaskDetailScreen({ taskId, onBack, onEdit }: TaskDetailScreenProps) {
  const { allTasks, deleteTask, toggleTaskStatus } = useTasks();
  const task = allTasks.find((t) => t.id === taskId);

  if (!task) {
    return (
      <div className="task-detail-screen">
        <div className="task-detail-error">Задача не найдена</div>
      </div>
    );
  }

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
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await deleteTask(taskId);
      onBack();
    }
  };

  const handleToggleStatus = async () => {
    await toggleTaskStatus(taskId);
  };

  return (
    <div className="task-detail-screen">
      <div className="task-detail-header">
        <h2 className="task-detail-title">Детали задачи</h2>
        <button className="task-detail-edit-button" onClick={onEdit}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="task-detail-content">
        <div className="task-detail-section">
          <div className="task-detail-checkbox-section">
            <div
              className={`task-detail-checkbox ${task.status === 'completed' ? 'completed' : ''}`}
              onClick={handleToggleStatus}
            >
              {task.status === 'completed' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <div className="task-detail-main">
              <h1 className={`task-detail-name ${task.status === 'completed' ? 'completed' : ''}`}>
                {task.title}
              </h1>
            </div>
          </div>
        </div>

        {task.description && (
          <div className="task-detail-section">
            <h3 className="task-detail-section-title">Описание</h3>
            <p className="task-detail-description">{task.description}</p>
          </div>
        )}

        <div className="task-detail-section">
          <h3 className="task-detail-section-title">Информация</h3>
          <div className="task-detail-info">
            <div className="task-detail-info-item">
              <span className="task-detail-info-label">Приоритет:</span>
              <span
                className="task-detail-info-value"
                style={{ color: priorityColors[task.priority] }}
              >
                {priorityLabels[task.priority]}
              </span>
            </div>
            {task.deadline && (
              <div className="task-detail-info-item">
                <span className="task-detail-info-label">Дедлайн:</span>
                <span className="task-detail-info-value">{formatDate(task.deadline)}</span>
              </div>
            )}
            <div className="task-detail-info-item">
              <span className="task-detail-info-label">Статус:</span>
              <span className="task-detail-info-value">
                {task.status === 'completed' ? 'Выполнена' : 'Активна'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="task-detail-footer">
        <button
          className="task-detail-action-button task-detail-action-button-danger"
          onClick={handleDelete}
        >
          Удалить задачу
        </button>
      </div>
    </div>
  );
}

