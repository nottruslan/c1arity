import { retrieveLaunchParams } from '@tma.js/sdk';

/**
 * Инициализация Telegram Mini Apps SDK
 */
export function initTMA() {
  try {
    const launchParams = retrieveLaunchParams();
    return launchParams;
  } catch (error) {
    console.error('Failed to initialize TMA SDK:', error);
    return null;
  }
}

