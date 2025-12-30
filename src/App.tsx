import { useEffect, useState, useCallback, useRef } from 'react';
import { init, backButton, viewport, cloudStorage } from '@tma.js/sdk';
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
  const { createTask } = useTasks(cloudStorage);
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');
  const [previousScreen, setPreviousScreen] = useState<Screen>('taskList');
  const [taskFormStep, setTaskFormStep] = useState(1);

  // Инициализация SDK единожды
  useEffect(() => {
    try {
      init();
    } catch (error) {
      console.error('Failed to init TMA SDK', error);
    }
  }, []);

  // Получаем safe area insets из viewport (учитывает системные элементы Telegram)
  // Адаптируется для обоих режимов: fullscreen и partial
  useEffect(() => {
    const updateSafeArea = () => {
      try {
        const state = viewport.state();
        if (state) {
          // Проверяем режим отображения
          const isExpanded = state.isExpanded || false;
          
          if (isExpanded) {
            // Fullscreen режим - есть системный header Telegram
            // Используем contentSafeAreaInsets, который учитывает header
            const insets = state.contentSafeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
            const topInset = Math.max(insets.top || 0, 44); // Минимум 44px для header
            document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${topInset}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${insets.bottom || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-left', `${insets.left || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-right', `${insets.right || 0}px`);
          } else {
            // Partial режим - нет системного header Telegram
            // Используем только safeAreaInsets для физических вырезов экрана
            const insets = state.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
            document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${insets.top || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${insets.bottom || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-left', `${insets.left || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-right', `${insets.right || 0}px`);
          }
        } else {
          // Fallback: устанавливаем нулевые отступы (для partial режима по умолчанию)
          document.documentElement.style.setProperty('--tg-safe-area-inset-top', '0px');
          document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', '0px');
          document.documentElement.style.setProperty('--tg-safe-area-inset-left', '0px');
          document.documentElement.style.setProperty('--tg-safe-area-inset-right', '0px');
        }
      } catch (error) {
        console.warn('Viewport not available:', error);
        // Fallback: нулевые отступы для partial режима
        document.documentElement.style.setProperty('--tg-safe-area-inset-top', '0px');
        document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', '0px');
        document.documentElement.style.setProperty('--tg-safe-area-inset-left', '0px');
        document.documentElement.style.setProperty('--tg-safe-area-inset-right', '0px');
      }
    };

    // Небольшая задержка для инициализации viewport
    const timer = setTimeout(updateSafeArea, 100);
    updateSafeArea();
    
    // Подписываемся на изменения viewport (включая изменение режима isExpanded)
    try {
      const unsubscribe = viewport.state.sub(updateSafeArea);
      return () => {
        clearTimeout(timer);
        unsubscribe();
      };
    } catch (error) {
      console.warn('Viewport events not available:', error);
      return () => clearTimeout(timer);
    }
  }, []);

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
    setTaskFormStep(1); // Сбрасываем шаг формы
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

  // Используем ref для хранения актуальных значений
  const navigationRef = useRef(navigation);
  const taskFormStepRef = useRef(taskFormStep);
  
  // Обновляем refs при изменении
  useEffect(() => {
    navigationRef.current = navigation;
  }, [navigation]);
  
  useEffect(() => {
    taskFormStepRef.current = taskFormStep;
  }, [taskFormStep]);

  // Управление системной BackButton Telegram
  useEffect(() => {
    const currentScreen = navigation.currentScreen;
    
    // Показываем BackButton только если не на главном экране
    if (currentScreen !== 'taskList') {
      try {
        backButton.show();
        
        const handleBackClick = () => {
          // Используем актуальные значения из refs
          const screen = navigationRef.current.currentScreen;
          const step = taskFormStepRef.current;
          
          if (screen === 'taskCreate') {
            // Если на экране создания задачи, обрабатываем шаги формы
            if (step > 1) {
              // Возвращаемся на предыдущий шаг
              setTaskFormStep(step - 1);
            } else {
              // На первом шаге - закрываем форму
              navigationRef.current.goBack();
            }
          } else {
            // Для других экранов - просто возвращаемся назад
            navigationRef.current.goBack();
          }
        };
        
        const unsubscribe = backButton.onClick(handleBackClick);
        return () => {
          unsubscribe();
          // Проверяем актуальный экран при очистке
          if (navigationRef.current.currentScreen === 'taskList') {
            backButton.hide();
          }
        };
      } catch (error) {
        console.warn('BackButton not available:', error);
      }
    } else {
      try {
        backButton.hide();
        // Сбрасываем шаг формы при возврате на главный экран
        setTaskFormStep(1);
      } catch (error) {
        console.warn('BackButton not available:', error);
      }
    }
  }, [navigation.currentScreen, taskFormStep]);

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
          onStepChange={setTaskFormStep}
          currentStep={taskFormStep}
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
