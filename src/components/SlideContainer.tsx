import { ReactNode } from 'react';
import './SlideContainer.css';

interface SlideContainerProps {
  children: ReactNode;
  direction: 'forward' | 'backward';
  isActive: boolean;
}

export function SlideContainer({ children, direction, isActive }: SlideContainerProps) {
  return (
    <div
      className={`slide-container ${direction} ${isActive ? 'active' : ''}`}
    >
      {children}
    </div>
  );
}

