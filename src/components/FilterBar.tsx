import { useTMA } from '../contexts/TMAContext';
import type { TaskFilters } from '../types/task';
import './FilterBar.css';

interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const { hapticFeedback } = useTMA();
  const handleStatusChange = (status: 'all' | 'pending' | 'completed') => {
    if (hapticFeedback) {
      hapticFeedback.impactOccurred('light');
    }
    onFiltersChange({ ...filters, status });
  };

  const handleDateChange = (date: 'all' | 'today' | 'week' | 'month') => {
    if (hapticFeedback) {
      hapticFeedback.impactOccurred('light');
    }
    onFiltersChange({ ...filters, date });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label" id="status-filter-label">Статус:</label>
        <div className="filter-buttons" role="group" aria-labelledby="status-filter-label">
          <button
            className={`filter-button ${filters.status === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusChange('all')}
          >
            Все
          </button>
          <button
            className={`filter-button ${filters.status === 'pending' ? 'active' : ''}`}
            onClick={() => handleStatusChange('pending')}
          >
            Активные
          </button>
          <button
            className={`filter-button ${filters.status === 'completed' ? 'active' : ''}`}
            onClick={() => handleStatusChange('completed')}
          >
            Выполненные
          </button>
        </div>
      </div>
      <div className="filter-group">
        <label className="filter-label" id="date-filter-label">Дата:</label>
        <div className="filter-buttons" role="group" aria-labelledby="date-filter-label">
          <button
            className={`filter-button ${filters.date === 'all' || !filters.date ? 'active' : ''}`}
            onClick={() => handleDateChange('all')}
          >
            Все
          </button>
          <button
            className={`filter-button ${filters.date === 'today' ? 'active' : ''}`}
            onClick={() => handleDateChange('today')}
          >
            Сегодня
          </button>
          <button
            className={`filter-button ${filters.date === 'week' ? 'active' : ''}`}
            onClick={() => handleDateChange('week')}
          >
            Неделя
          </button>
          <button
            className={`filter-button ${filters.date === 'month' ? 'active' : ''}`}
            onClick={() => handleDateChange('month')}
          >
            Месяц
          </button>
        </div>
      </div>
    </div>
  );
}

