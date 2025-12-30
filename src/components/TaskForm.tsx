import { useState, useEffect } from 'react';
import { backButton } from '@tma.js/sdk';
import type { TaskPriority } from '../types/task';
import './TaskForm.css';

interface TaskFormProps {
  initialData?: {
    title: string;
    description: string;
    priority: TaskPriority;
    deadline?: string;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    deadline?: string;
  }) => void;
  onCancel: () => void;
}

export function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState('');

  // Сброс формы при монтировании (для нового создания задачи)
  useEffect(() => {
    if (!initialData) {
      setStep(1);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDeadline('');
    } else {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'medium');
      setDeadline(initialData.deadline || '');
    }
  }, [initialData]);

  // Обработка системной BackButton для формы
  useEffect(() => {
    try {
      const unsubscribe = backButton.onClick(() => {
        if (step > 1) {
          setStep(step - 1);
        } else {
          // На первом шаге - закрываем форму
          onCancel();
        }
      });
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.warn('BackButton not available:', error);
    }
  }, [step, onCancel]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        deadline: deadline || undefined,
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return title.trim().length > 0;
      default:
        return true;
    }
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="task-form">
      <div className="task-form-header">
        <h2 className="task-form-title">
          {step === 1 && 'Название'}
          {step === 2 && 'Описание'}
          {step === 3 && 'Приоритет'}
          {step === 4 && 'Дедлайн'}
        </h2>
      </div>

      <div className="task-form-content">
        <div className="task-form-steps">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`task-form-step ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="task-form-fields">
          {step === 1 && (
            <div className="task-form-field">
              <label className="task-form-label">Название задачи *</label>
              <input
                type="text"
                className="task-form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название задачи"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="task-form-field">
              <label className="task-form-label">Описание (необязательно)</label>
              <textarea
                className="task-form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Добавьте описание задачи"
                rows={6}
              />
            </div>
          )}

          {step === 3 && (
            <div className="task-form-field">
              <label className="task-form-label">Приоритет</label>
              <div className="task-form-priority-options">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    className={`task-form-priority-button ${priority === p ? 'active' : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    {p === 'low' && 'Низкий'}
                    {p === 'medium' && 'Средний'}
                    {p === 'high' && 'Высокий'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="task-form-field">
              <label className="task-form-label">Дедлайн (необязательно)</label>
              <input
                type="date"
                className="task-form-input"
                value={formatDateForInput(deadline)}
                onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')}
                min={new Date().toISOString().split('T')[0]}
              />
              {deadline && (
                <button
                  className="task-form-clear-date"
                  onClick={() => setDeadline('')}
                >
                  Убрать дедлайн
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="task-form-footer">
        <button
          className="task-form-button task-form-button-primary"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {step === 4 ? 'Создать' : 'Далее'}
        </button>
      </div>
    </div>
  );
}

