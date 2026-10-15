import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

export const SkipToContent: React.FC = () => {
  const { t } = useI18n();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-yellow-400 focus:text-black focus:font-black focus:text-sm focus:rounded-xl focus:shadow-2xl focus:ring-4 focus:ring-black focus:outline-hidden transition-all duration-150"
    >
      {t('a11y.skipToContent')}
    </a>
  );
};
