import { TaskForm } from '../components/TaskForm';
import type { TaskPriority } from '../types/task';
import './TaskCreateScreen.css';

interface TaskCreateScreenProps {
  onSave: (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    deadline?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function TaskCreateScreen({ onSave, onCancel }: TaskCreateScreenProps) {
  const handleSubmit = async (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    deadline?: string;
  }) => {
    await onSave(data);
  };

  return (
    <div className="task-create-screen">
      <TaskForm onSubmit={handleSubmit} onCancel={onCancel} />
    </div>
  );
}

