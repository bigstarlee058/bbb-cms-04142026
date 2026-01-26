import { useLanguageStore } from '@/stores/languages';

export type LanguageSwitcherVariant = 'pills' | 'tabs' | 'dropdown';
export type LanguageSwitcherSize = 'sm' | 'md';

interface LanguageSwitcherProps {
  availableLanguages?: Array<{ key: string; name: string }>;
  selectedLang: string | null;
  onLanguageChange: (langKey: string | null) => void;
  defaultLabel?: string;
  variant?: LanguageSwitcherVariant;
  size?: LanguageSwitcherSize;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

const sizeClasses = {
  sm: { button: 'px-2 py-1', text: 'text-xs' },
  md: { button: 'px-3 py-1.5', text: 'text-sm' },
};

export const LanguageSwitcher = ({
  availableLanguages,
  selectedLang,
  onLanguageChange,
  defaultLabel = 'English',
  variant = 'pills',
  size = 'sm',
  className = '',
  showLabel = true,
  label = 'Language:',
}: LanguageSwitcherProps) => {
  const storeLanguages = useLanguageStore((state) => state.languages);
  const languages = availableLanguages || storeLanguages;

  if (languages.length === 0) {
    return null;
  }

  const { button: buttonSize, text: textSize } = sizeClasses[size];

  const getButtonClass = (isActive: boolean) => {
    const base = `${buttonSize} ${textSize} font-medium rounded transition-colors`;
    
    if (variant === 'pills') {
      return `${base} ${
        isActive
          ? 'bg-bbb text-white'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
      }`;
    }
    
    if (variant === 'tabs') {
      return `${base} border-b-2 rounded-none ${
        isActive
          ? 'border-bbb text-bbb'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`;
    }
    
    return base;
  };

  if (variant === 'dropdown') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className={`${textSize} font-medium text-gray-600`}>{label}</span>
        )}
        <select
          value={selectedLang || ''}
          onChange={(e) => onLanguageChange(e.target.value || null)}
          className={`${buttonSize} ${textSize} border border-gray-300 rounded-md focus:ring-bbb focus:border-bbb`}
        >
          <option value="">{defaultLabel}</option>
          {languages.map((lang) => (
            <option key={lang.key} value={lang.key}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${
        variant === 'pills' ? 'bg-gray-50 p-2 rounded-lg border border-gray-200' : ''
      } ${className}`}
    >
      {showLabel && (
        <span className={`${textSize} font-medium text-gray-600`}>{label}</span>
      )}
      <button
        type="button"
        onClick={() => onLanguageChange(null)}
        className={getButtonClass(!selectedLang)}
      >
        {defaultLabel}
      </button>
      {languages.map((lang) => (
        <button
          type="button"
          key={lang.key}
          onClick={() => onLanguageChange(lang.key)}
          className={getButtonClass(selectedLang === lang.key)}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};