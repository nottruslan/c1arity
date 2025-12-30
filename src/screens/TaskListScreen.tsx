import { useTasks } from '../hooks/useTasks';
import { useTMA } from '../contexts/TMAContext';
import { TaskCard } from '../components/TaskCard';
import { FilterBar } from '../components/FilterBar';
import './TaskListScreen.css';

interface TaskListScreenProps {
  onCreateTask: () => void;
  onTaskClick: (taskId: string) => void;
}

export function TaskListScreen({ onCreateTask, onTaskClick }: TaskListScreenProps) {
  const { cloudStorage, hapticFeedback } = useTMA();
  
  const handleCreateTask = () => {
    if (hapticFeedback) {
      hapticFeedback.impactOccurred('medium');
    }
    onCreateTask();
  };
  const {
    tasks,
    loading,
    filters,
    setFilters,
    toggleTaskStatus,
  } = useTasks(cloudStorage);

  if (loading) {
    return (
      <div className="task-list-screen loading">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="task-list-screen">
      <div className="task-list-header">
        <h1 className="task-list-title">Задачи</h1>
        <button className="create-task-button" onClick={handleCreateTask}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      <div className="task-list-content">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="empty-state-text">Нет задач</p>
            <p className="empty-state-subtext">Создайте первую задачу</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => {
                  if (hapticFeedback) {
                    hapticFeedback.impactOccurred('light');
                  }
                  onTaskClick(task.id);
                }}
                onToggleStatus={() => {
                  if (hapticFeedback) {
                    hapticFeedback.impactOccurred('medium');
                  }
                  toggleTaskStatus(task.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

