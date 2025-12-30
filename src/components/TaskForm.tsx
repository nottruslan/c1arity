import { useState, useEffect, useCallback } from 'react';
import { useTMA } from '../contexts/TMAContext';
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
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

export function TaskForm({ initialData, onSubmit, onStepChange, currentStep }: TaskFormProps) {
  // Используем внешний currentStep если он передан, иначе внутреннее состояние
  const [internalStep, setInternalStep] = useState(1);
  
  // Определяем актуальный шаг - приоритет у внешнего currentStep
  const step = currentStep !== undefined ? currentStep : internalStep;
  
  // Синхронизация внешнего currentStep с внутренним состоянием
  useEffect(() => {
    if (currentStep !== undefined) {
      setInternalStep(currentStep);
    }
  }, [currentStep]);
  
  // Функция для изменения шага
  const setStep = useCallback((newStep: number) => {
    setInternalStep(newStep);
    if (onStepChange) {
      onStepChange(newStep);
    }
  }, [onStepChange]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState('');

  // Сброс формы при монтировании (для нового создания задачи)
  useEffect(() => {
    if (!initialData) {
      const resetStep = 1;
      setInternalStep(resetStep);
      if (onStepChange) {
        onStepChange(resetStep);
      }
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
  }, [initialData, onStepChange]);

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

  // Управление MainButton
  useEffect(() => {
    if (mainButton) {
      const buttonText = step === 4 ? 'Создать' : 'Далее';
      const isDisabled = !canProceed();
      
      mainButton.setText(buttonText);
      if (isDisabled) {
        mainButton.disable();
      } else {
        mainButton.enable();
      }
      mainButton.show();
      
      const handleClick = () => {
        if (canProceed()) {
          handleNext();
        }
      };
      
      mainButton.onClick(handleClick);
      
      return () => {
        mainButton.offClick(handleClick);
        mainButton.hide();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, title, mainButton, handleNext]);

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
              <label className="task-form-label" htmlFor="task-title-input">
                Название задачи *
              </label>
              <input
                id="task-title-input"
                type="text"
                className="task-form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название задачи"
                autoFocus
                aria-required="true"
                aria-label="Название задачи"
              />
            </div>
          )}

          {step === 2 && (
            <div className="task-form-field">
              <label className="task-form-label" htmlFor="task-description-input">
                Описание (необязательно)
              </label>
              <textarea
                id="task-description-input"
                className="task-form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Добавьте описание задачи"
                rows={6}
                aria-label="Описание задачи"
              />
            </div>
          )}

          {step === 3 && (
            <div className="task-form-field">
              <label className="task-form-label" id="priority-label">
                Приоритет
              </label>
              <div className="task-form-priority-options" role="radiogroup" aria-labelledby="priority-label">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    className={`task-form-priority-button ${priority === p ? 'active' : ''}`}
                    onClick={() => setPriority(p)}
                    role="radio"
                    aria-checked={priority === p}
                    aria-label={`Приоритет: ${p === 'low' ? 'Низкий' : p === 'medium' ? 'Средний' : 'Высокий'}`}
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

      {/* MainButton управляется через useEffect, обычная кнопка скрыта для совместимости */}
      <div className="task-form-footer" style={{ display: 'none' }}>
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

