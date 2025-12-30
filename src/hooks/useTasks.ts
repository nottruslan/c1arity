import { useState, useEffect, useCallback } from 'react';
import type { CloudStorage } from '@tma.js/sdk';
import type { Task, TaskFilters, TaskSortBy, TaskSortOrder } from '../types/task';
import { saveTasks, loadTasks } from '../lib/storage';

export function useTasks(cloudStorageInstance?: CloudStorage | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({ status: 'all' });
  const [sortBy, setSortBy] = useState<TaskSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');

  // Загрузка задач при монтировании
  useEffect(() => {
    if (cloudStorageInstance) {
      loadTasks(cloudStorageInstance)
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
  }, [cloudStorageInstance]);

  // Создание задачи - используем функциональное обновление состояния и ждем сохранения
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!cloudStorageInstance) {
      console.error('CloudStorage is not available');
      throw new Error('CloudStorage is not available');
    }
    
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('Creating new task:', newTask);
    
    // Используем функциональное обновление для получения актуального состояния
    let updatedTasks: Task[] = [];
    setTasks((prevTasks) => {
      updatedTasks = [...prevTasks, newTask];
      return updatedTasks;
    });

    // Ждем сохранения перед возвратом
    try {
      await saveTasks(cloudStorageInstance, updatedTasks);
      console.log('Task created and saved successfully');
    } catch (error) {
      console.error('Failed to save task after creation:', error);
      // Откатываем изменение состояния при ошибке
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== newTask.id));
      throw error;
    }
    
    return newTask;
  }, [cloudStorageInstance]);

  // Обновление задачи - используем функциональное обновление
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!cloudStorageInstance) {
      console.error('CloudStorage is not available');
      return;
    }
    
    let updatedTasks: Task[] = [];
    setTasks((prevTasks) => {
      updatedTasks = prevTasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      );
      return updatedTasks;
    });
    
    // Сохраняем после обновления состояния
    try {
      await saveTasks(cloudStorageInstance, updatedTasks);
    } catch (error) {
      console.error('Failed to save tasks after update:', error);
    }
  }, [cloudStorageInstance]);

  // Удаление задачи - используем функциональное обновление
  const deleteTask = useCallback(async (id: string) => {
    if (!cloudStorageInstance) {
      console.error('CloudStorage is not available');
      return;
    }
    
    let filteredTasks: Task[] = [];
    setTasks((prevTasks) => {
      filteredTasks = prevTasks.filter((task) => task.id !== id);
      return filteredTasks;
    });
    
    // Сохраняем после обновления состояния
    try {
      await saveTasks(cloudStorageInstance, filteredTasks);
    } catch (error) {
      console.error('Failed to save tasks after deletion:', error);
    }
  }, [cloudStorageInstance]);

  // Переключение статуса задачи
  const toggleTaskStatus = useCallback(async (id: string) => {
    if (!cloudStorageInstance) {
      console.error('CloudStorage is not available');
      return;
    }
    
    let updatedTasks: Task[] = [];
    setTasks((prevTasks) => {
      const task = prevTasks.find((t) => t.id === id);
      if (!task) return prevTasks;
      
      // Явно указываем тип статуса
      const newStatus: 'pending' | 'completed' = task.status === 'completed' ? 'pending' : 'completed';
      updatedTasks = prevTasks.map((t) =>
        t.id === id
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      );
      return updatedTasks;
    });
    
    // Сохраняем после обновления состояния
    if (updatedTasks.length > 0) {
      try {
        await saveTasks(cloudStorageInstance, updatedTasks);
      } catch (error) {
        console.error('Failed to save tasks after toggle:', error);
        // Можно добавить откат состояния при ошибке
      }
    }
  }, [cloudStorageInstance]);

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

