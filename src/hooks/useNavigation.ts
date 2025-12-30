import { useState, useCallback } from 'react';
import type { Screen, NavigationState } from '../types/navigation';

const initialState: NavigationState = {
  currentScreen: 'taskList',
  history: ['taskList'],
};

export function useNavigation() {
  const [state, setState] = useState<NavigationState>(initialState);

  const navigate = useCallback((screen: Screen, params?: Record<string, any>) => {
    setState((prev) => ({
      currentScreen: screen,
      history: [...prev.history, screen],
      params,
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.history.length <= 1) {
        return prev;
      }
      const newHistory = [...prev.history];
      newHistory.pop();
      const currentScreen = newHistory[newHistory.length - 1];
      return {
        currentScreen,
        history: newHistory,
        params: undefined,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    currentScreen: state.currentScreen,
    params: state.params,
    navigate,
    goBack,
    canGoBack: state.history.length > 1,
    reset,
  };
}

