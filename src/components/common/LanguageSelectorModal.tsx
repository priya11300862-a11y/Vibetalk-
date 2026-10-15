import React, { useEffect, useRef } from 'react';
import { X, Check, Globe } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { SupportedLanguage } from '../../i18n/translations';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, setLanguage, availableLanguages, t } = useI18n();
  const { announce, isHighContrast } = useAccessibility();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectLanguage = (code: SupportedLanguage, name: string) => {
    setLanguage(code);
    announce(`Language changed to ${name}. Interface updated.`, 'assertive');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      ref={modalRef}
    >
      <div
        className={`w-full max-w-lg rounded-xl border p-5 sm:p-6 shadow-xl relative text-left transition-colors animate-in fade-in zoom-in-95 duration-150 ${
          isHighContrast
            ? 'bg-black border-white text-white'
            : 'bg-white border-[#E1E5EC] text-[#303641]'
        }`}
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label={t('a11y.closeDialog')}
          className={`absolute top-5 right-5 p-1.5 rounded-lg transition-colors focus:ring-2 focus:ring-[#1877F2] ${
            isHighContrast
              ? 'text-white hover:text-yellow-300'
              : 'text-[#7B8492] hover:text-[#303641]'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#EAF2FF] text-[#1877F2] flex items-center justify-center">
            <Globe className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="language-modal-title" className="text-lg font-bold tracking-tight text-[#303641]">
              {t('language.selectTitle')}
            </h2>
            <p className="text-xs text-[#7B8492] mt-0.5">
              {t('language.selectDesc')}
            </p>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label={t('language.selectTitle')}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-h-[60vh] overflow-y-auto pr-1"
        >
          {availableLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectLanguage(lang.code, lang.name)}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? isHighContrast
                      ? 'bg-yellow-400 text-black border-white font-bold'
                      : 'bg-[#EAF2FF] border-[#1877F2] text-[#1877F2]'
                    : isHighContrast
                    ? 'border-white text-white hover:bg-white/10'
                    : 'bg-[#F5F7FC] border-[#E1E5EC] hover:border-[#CBD5E1] text-[#303641] hover:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-[#1877F2]`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-[#1877F2] text-white'
                        : 'bg-white border border-[#E1E5EC] text-[#7B8492]'
                    }`}
                  >
                    {lang.badge}
                  </span>
                  <div>
                    <div className="font-semibold text-xs tracking-tight flex items-center gap-1.5">
                      <span>{lang.nativeName}</span>
                      {isSelected && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#1877F2]/10 text-[#1877F2]">
                          {t('language.current')}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#7B8492]">{lang.name}</div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#CBD5E1]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-[#E1E5EC] flex items-center justify-between text-xs text-[#7B8492]">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#16865C]" />
            <span>Preferences saved in local storage</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium text-xs transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
