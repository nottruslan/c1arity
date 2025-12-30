export type TaskStatus = 'pending' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline?: string; // ISO date string
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: 'all' | TaskStatus;
  date?: 'all' | 'today' | 'week' | 'month';
  priority?: 'all' | TaskPriority;
}

export type TaskSortBy = 'createdAt' | 'deadline' | 'priority';

export type TaskSortOrder = 'asc' | 'desc';

