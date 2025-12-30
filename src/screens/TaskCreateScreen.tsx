import { useEffect, useState } from 'react';
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
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

export function TaskCreateScreen({ onSave, onCancel, onStepChange, currentStep }: TaskCreateScreenProps) {
  // Используем key для полного сброса формы при каждом открытии
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    // Сбрасываем форму при открытии экрана
    setFormKey(prev => prev + 1);
  }, []);

  const handleSubmit = async (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    deadline?: string;
  }) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Не удалось сохранить задачу. Попробуйте еще раз.');
    }
  };

  return (
    <div className="task-create-screen">
      <TaskForm 
        key={formKey}
        onSubmit={handleSubmit} 
        onCancel={onCancel}
        onStepChange={onStepChange}
        currentStep={currentStep}
      />
    </div>
  );
}

