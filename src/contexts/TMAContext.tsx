import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  init, 
  cloudStorage, 
  backButton, 
  viewport, 
  webApp,
  themeParams,
  hapticFeedback,
  mainButton,
  popup,
  settingsButton,
  closingBehavior
} from '@tma.js/sdk';
import type { CloudStorage, ThemeParams } from '@tma.js/sdk';

interface TMAContextValue {
  cloudStorage: CloudStorage | null;
  themeParams: ThemeParams | null;
  hapticFeedback: typeof hapticFeedback | null;
  mainButton: typeof mainButton | null;
  popup: typeof popup | null;
  settingsButton: typeof settingsButton | null;
  closingBehavior: typeof closingBehavior | null;
  isInitialized: boolean;
}

const TMAContext = createContext<TMAContextValue | null>(null);

interface TMAProviderProps {
  children: ReactNode;
}

export function TMAProvider({ children }: TMAProviderProps) {
  const [cloudStorageInstance, setCloudStorageInstance] = useState<CloudStorage | null>(null);
  const [themeParamsInstance, setThemeParamsInstance] = useState<ThemeParams | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Применение темы через CSS-переменные
  const applyTheme = (theme: ThemeParams) => {
    const root = document.documentElement;
    
    if (theme.bgColor) {
      root.style.setProperty('--tg-theme-bg-color', theme.bgColor);
    }
    if (theme.textColor) {
      root.style.setProperty('--tg-theme-text-color', theme.textColor);
    }
    if (theme.hintColor) {
      root.style.setProperty('--tg-theme-hint-color', theme.hintColor);
    }
    if (theme.linkColor) {
      root.style.setProperty('--tg-theme-link-color', theme.linkColor);
    }
    if (theme.buttonColor) {
      root.style.setProperty('--tg-theme-button-color', theme.buttonColor);
    }
    if (theme.buttonTextColor) {
      root.style.setProperty('--tg-theme-button-text-color', theme.buttonTextColor);
    }
    if (theme.secondaryBgColor) {
      root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondaryBgColor);
    }
  };

  useEffect(() => {
    try {
      // Инициализация SDK
      init();
      
      // Уведомляем Telegram что приложение готово
      if (webApp) {
        webApp.ready();
        // Запрашиваем полноэкранный режим
        if (webApp.expand) {
          webApp.expand();
        }
      }

      // Инициализируем CloudStorage
      if (cloudStorage) {
        setCloudStorageInstance(cloudStorage);
      }

      // Инициализируем ThemeParams
      if (themeParams) {
        const initialTheme = themeParams.state();
        setThemeParamsInstance(initialTheme);
        if (initialTheme) {
          applyTheme(initialTheme);
        }
        // Подписываемся на изменения темы
        const unsubscribe = themeParams.state.sub((theme) => {
          setThemeParamsInstance(theme);
          // Применяем CSS-переменные темы
          if (theme) {
            applyTheme(theme);
          }
        });
        return () => unsubscribe();
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize TMA SDK:', error);
      setIsInitialized(false);
    }
  }, []);

  const value: TMAContextValue = {
    cloudStorage: cloudStorageInstance,
    themeParams: themeParamsInstance,
    hapticFeedback: hapticFeedback || null,
    mainButton: mainButton || null,
    popup: popup || null,
    settingsButton: settingsButton || null,
    closingBehavior: closingBehavior || null,
    isInitialized,
  };

  return <TMAContext.Provider value={value}>{children}</TMAContext.Provider>;
}

export function useTMA() {
  const context = useContext(TMAContext);
  if (!context) {
    throw new Error('useTMA must be used within TMAProvider');
  }
  return context;
}

