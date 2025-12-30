import type { CloudStorage } from '@tma.js/sdk';
import type { Task } from '../types/task';

const STORAGE_KEY = 'clarity_tasks';

/**
 * Сохранение задач в Cloud Storage
 */
export async function saveTasks(
  cloudStorage: CloudStorage,
  tasks: Task[]
): Promise<void> {
  try {
    await cloudStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks:', error);
    throw error;
  }
}

/**
 * Загрузка задач из Cloud Storage
 */
export async function loadTasks(
  cloudStorage: CloudStorage
): Promise<Task[]> {
  try {
    const data = await cloudStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

/**
 * Удаление всех задач из Cloud Storage
 */
export async function clearTasks(
  cloudStorage: CloudStorage
): Promise<void> {
  try {
    await cloudStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Failed to clear tasks:', error);
    throw error;
  }
}

