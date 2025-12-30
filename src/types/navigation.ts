export type Screen = 'taskList' | 'taskCreate' | 'taskDetail';

export interface NavigationState {
  currentScreen: Screen;
  history: Screen[];
  params?: Record<string, any>;
}

