import { useLanguageStore } from '@/stores/languages';

export type LanguageSelectorVariant = 'checkbox' | 'chips';
export type LanguageSelectorSize = 'sm' | 'md';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onToggle: (langKey: string) => void;
  variant?: LanguageSelectorVariant;
  size?: LanguageSelectorSize;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  englishLocked?: boolean;
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  sm: { checkbox: 'h-3.5 w-3.5', text: 'text-xs', chip: 'px-2 py-0.5 text-xs' },
  md: { checkbox: 'h-4 w-4', text: 'text-sm', chip: 'px-3 py-1 text-sm' },
};

export const LanguageSelector = ({
  selectedLanguages,
  onToggle,
  variant = 'checkbox',
  size = 'md',
  label = 'Available in languages:',
  showLabel = true,
  helperText,
  englishLocked = true,
  className = '',
  disabled = false,
}: LanguageSelectorProps) => {
  const apiLanguages = useLanguageStore((state) => state.languages);
  
  if (apiLanguages.length === 0) {
    return null;
  }

  const { checkbox: checkboxSize, text: textSize, chip: chipSize } = sizeClasses[size];

  const renderCheckboxVariant = () => (
    <div className="flex flex-wrap gap-3 mb-4">
      {englishLocked && (
        <label className="inline-flex items-center cursor-default opacity-75">
          <input
            type="checkbox"
            checked={true}
            disabled={true}
            className={`${checkboxSize} border-gray-300 rounded focus:ring-bbb accent-bbb`}
          />
          <span className={`ml-2 ${textSize} font-medium text-gray-700`}>
            English
          </span>
        </label>
      )}
      {apiLanguages.map((lang) => {
        const isSelected = selectedLanguages.includes(lang.key);
        return (
          <label 
            key={lang.key} 
            className={`inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(lang.key)}
              disabled={disabled}
              className={`${checkboxSize} border-gray-300 rounded focus:ring-bbb accent-bbb cursor-pointer disabled:cursor-not-allowed`}
            />
            <span className={`ml-2 ${textSize} font-medium text-gray-700`}>
              {lang.name}
            </span>
          </label>
        );
      })}
    </div>
  );

  const renderChipsVariant = () => (
    <div className="flex flex-wrap gap-2">
      {englishLocked && (
        <span className={`${chipSize} font-medium rounded-full bg-bbb text-white`}>
          English ✓
        </span>
      )}
      {apiLanguages.map((lang) => {
        const isSelected = selectedLanguages.includes(lang.key);
        return (
          <button
            key={lang.key}
            type="button"
            onClick={() => !disabled && onToggle(lang.key)}
            disabled={disabled}
            className={`${chipSize} font-medium rounded-full transition-colors ${
              isSelected
                ? 'bg-bbb text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {lang.name} {isSelected && '✓'}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={className}>
      {showLabel && (
        <label className={`block ${textSize} font-medium text-gray-700 mb-2`}>
          {label}
        </label>
      )}
      
      {variant === 'checkbox' && renderCheckboxVariant()}
      {variant === 'chips' && renderChipsVariant()}
      
      {helperText && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};