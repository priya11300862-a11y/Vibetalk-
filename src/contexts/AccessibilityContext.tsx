import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  setHighContrast: (value: boolean) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const STORAGE_KEY = 'vibetalk_high_contrast';

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

function getInitialHighContrast(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    // Also respect user OS setting for contrast
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-contrast: more)').matches;
    }
  } catch (err) {
    console.warn('Unable to access localStorage for contrast preference:', err);
  }
  return false;
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState<boolean>(getInitialHighContrast);
  const [politeAnnouncement, setPoliteAnnouncement] = useState<string>('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState<string>('');

  // Sync DOM classes and attributes whenever isHighContrast changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isHighContrast) {
      root.classList.add('high-contrast');
      body.classList.add('high-contrast');
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      body.classList.remove('high-contrast');
      root.removeAttribute('data-high-contrast');
    }

    try {
      localStorage.setItem(STORAGE_KEY, String(isHighContrast));
    } catch (err) {
      console.warn('Unable to save high-contrast preference:', err);
    }
  }, [isHighContrast]);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast((prev) => {
      const next = !prev;
      announce(
        next
          ? 'High contrast mode enabled. Display colors and borders adjusted for WCAG AA compliance.'
          : 'High contrast mode disabled. Default visual theme restored.',
        'polite'
      );
      return next;
    });
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setIsHighContrast(value);
    announce(
      value
        ? 'High contrast mode enabled for WCAG AA compliance.'
        : 'High contrast mode disabled.',
      'polite'
    );
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveAnnouncement('');
      setTimeout(() => setAssertiveAnnouncement(message), 50);
    } else {
      setPoliteAnnouncement('');
      setTimeout(() => setPoliteAnnouncement(message), 50);
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        isHighContrast,
        toggleHighContrast,
        setHighContrast,
        announce,
      }}
    >
      {/* Screen Reader Live Announcement Regions */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only select-none pointer-events-none"
        id="a11y-live-polite"
      >
        {politeAnnouncement}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only select-none pointer-events-none"
        id="a11y-live-assertive"
      >
        {assertiveAnnouncement}
      </div>

      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
