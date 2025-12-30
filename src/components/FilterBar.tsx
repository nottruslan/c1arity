import type { TaskFilters } from '../types/task';
import './FilterBar.css';

interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const handleStatusChange = (status: 'all' | 'pending' | 'completed') => {
    onFiltersChange({ ...filters, status });
  };

  const handleDateChange = (date: 'all' | 'today' | 'week' | 'month') => {
    onFiltersChange({ ...filters, date });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Статус:</label>
        <div className="filter-buttons">
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
        <label className="filter-label">Дата:</label>
        <div className="filter-buttons">
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

