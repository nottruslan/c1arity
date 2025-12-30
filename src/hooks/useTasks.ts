import { useState, useEffect, useCallback } from 'react';
import { cloudStorage } from '@tma.js/sdk';
import type { Task, TaskFilters, TaskSortBy, TaskSortOrder } from '../types/task';
import { saveTasks, loadTasks } from '../lib/storage';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({ status: 'all' });
  const [sortBy, setSortBy] = useState<TaskSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');

  // Загрузка задач при монтировании
  useEffect(() => {
    if (cloudStorage) {
      loadTasks(cloudStorage)
        .then((loadedTasks) => {
          setTasks(loadedTasks);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [cloudStorage]);

  // Сохранение задач при изменении
  const saveTasksToStorage = useCallback(async (tasksToSave: Task[]) => {
    if (cloudStorage) {
      try {
        await saveTasks(cloudStorage, tasksToSave);
        setTasks(tasksToSave);
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    }
  }, [cloudStorage]);

  // Создание задачи
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveTasksToStorage([...tasks, newTask]);
    return newTask;
  }, [tasks, saveTasksToStorage]);

  // Обновление задачи
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    await saveTasksToStorage(updatedTasks);
  }, [tasks, saveTasksToStorage]);

  // Удаление задачи
  const deleteTask = useCallback(async (id: string) => {
    const filteredTasks = tasks.filter((task) => task.id !== id);
    await saveTasksToStorage(filteredTasks);
  }, [tasks, saveTasksToStorage]);

  // Переключение статуса задачи
  const toggleTaskStatus = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await updateTask(id, {
        status: task.status === 'completed' ? 'pending' : 'completed',
      });
    }
  }, [tasks, updateTask]);

  // Фильтрация и сортировка задач
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      if (filters.date && filters.date !== 'all') {
        const now = new Date();
        const taskDate = task.deadline ? new Date(task.deadline) : new Date(task.createdAt);
        switch (filters.date) {
          case 'today':
            if (taskDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (taskDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (taskDate < monthAgo) return false;
            break;
        }
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'deadline':
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          comparison = aDeadline - bDeadline;
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return {
    tasks: filteredAndSortedTasks,
    allTasks: tasks,
    loading,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  };
}

