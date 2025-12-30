import { useEffect, useState, useCallback } from 'react';
import { init } from '@tma.js/sdk';
import { useNavigation } from './hooks/useNavigation';
import { useTasks } from './hooks/useTasks';
import { SlideContainer } from './components/SlideContainer';
import { TaskListScreen } from './screens/TaskListScreen';
import { TaskCreateScreen } from './screens/TaskCreateScreen';
import { TaskDetailScreen } from './screens/TaskDetailScreen';
import type { Screen } from './types/navigation';
import './App.css';

function AppContent() {
  const navigation = useNavigation();
  const { createTask } = useTasks();
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');
  const [previousScreen, setPreviousScreen] = useState<Screen>('taskList');

  // Отслеживание направления навигации
  useEffect(() => {
    if (previousScreen !== navigation.currentScreen) {
      // Определяем направление на основе порядка экранов
      const screenOrder: Record<Screen, number> = {
        taskList: 0,
        taskCreate: 1,
        taskDetail: 2,
      };
      const prevOrder = screenOrder[previousScreen] ?? 0;
      const currOrder = screenOrder[navigation.currentScreen] ?? 0;
      setNavigationDirection(currOrder > prevOrder ? 'forward' : 'backward');
      setPreviousScreen(navigation.currentScreen);
    }
  }, [navigation.currentScreen, previousScreen]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate('taskCreate');
  }, [navigation]);

  const handleTaskClick = useCallback((taskId: string) => {
    navigation.navigate('taskDetail', { taskId });
  }, [navigation]);

  const handleSaveTask = useCallback(async (data: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
  }) => {
    await createTask({
      ...data,
      status: 'pending',
    });
    navigation.goBack();
  }, [createTask, navigation]);

  const handleEditTask = useCallback((taskId: string) => {
    // Для редактирования можно использовать тот же экран создания
    // или создать отдельный экран редактирования
    navigation.navigate('taskCreate', { taskId, edit: true });
  }, [navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <div className="app">
      <SlideContainer
        key="taskList"
        direction={navigationDirection}
        isActive={navigation.currentScreen === 'taskList'}
      >
        <TaskListScreen
          onCreateTask={handleCreateTask}
          onTaskClick={handleTaskClick}
        />
      </SlideContainer>
      
      <SlideContainer
        key="taskCreate"
        direction={navigationDirection}
        isActive={navigation.currentScreen === 'taskCreate'}
      >
        <TaskCreateScreen
          onSave={handleSaveTask}
          onCancel={handleBack}
        />
      </SlideContainer>
      
      {navigation.params && navigation.params.taskId && (
        <SlideContainer
          key={`taskDetail-${navigation.params.taskId}`}
          direction={navigationDirection}
          isActive={navigation.currentScreen === 'taskDetail'}
        >
          <TaskDetailScreen
            taskId={navigation.params.taskId}
            onBack={handleBack}
            onEdit={() => handleEditTask(navigation.params!.taskId)}
          />
        </SlideContainer>
      )}
    </div>
  );
}

function App() {
  useEffect(() => {
    init();
  }, []);

  return <AppContent />;
}

export default App;
