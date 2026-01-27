import { FormikProps } from 'formik';
import './quill.snow.css';
import { useQuill } from 'react-quilljs';
import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { CheckIcon } from '@heroicons/react/solid';
import { getIn } from 'formik';

interface Props {
  formik: FormikProps<any>;
  label?: string;
  name: string;
  translationField?: string;
  selectedLanguages: string[];
  placeholder?: string;
}

export const TranslatableTextareaWithFormatting = ({
  label,
  formik,
  name,
  translationField = `${name}Translations`,
  selectedLanguages,
}: Props) => {
  const apiLanguages = useLanguageStore((state) => state.languages);
  const [activeLanguage, setActiveLanguage] = useState('en');

  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ],
    },
    formats: ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'indent'],
  });

  useEffect(() => {
    if (activeLanguage !== 'en' && !selectedLanguages.includes(activeLanguage)) {
      setActiveLanguage('en');
    }
  }, [selectedLanguages, activeLanguage]);

  const currentFieldName = activeLanguage === 'en' ? name : `${translationField}.${activeLanguage}`;
  const fieldValue = getIn(formik.values, currentFieldName) || '';

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(fieldValue);
      
      const handler = () => {
        formik.setFieldValue(currentFieldName, quill.root.innerHTML);
      };

      quill.on('text-change', handler);
      return () => {
        quill.off('text-change', handler);
      };
    }
  }, [quill, activeLanguage]);

  const isFieldValid = (langKey: string) => {
    const field = langKey === 'en' ? name : `${translationField}.${langKey}`;
    const value = getIn(formik.values, field);
    const error = getIn(formik.errors, field);
    return !error && value && value.trim().length > 0;
  };

  const hasSelectedOtherLanguages = selectedLanguages.length > 0;

  return (
    <div className="mb-2 mt-2">
      {hasSelectedOtherLanguages && (
        <div className="flex flex-wrap gap-2 mb-2">
          <label
            className={`inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-all border ${
              activeLanguage === 'en'
                ? 'bg-bbb border-bbb text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              checked={activeLanguage === 'en'}
              onChange={() => setActiveLanguage('en')}
              className="sr-only"
            />
            <span className="font-medium">{label} (EN)</span>
            {isFieldValid('en') && (
              <CheckIcon className={`h-3 w-3 ml-1 ${activeLanguage === 'en' ? 'text-white' : 'text-green-600'}`} />
            )}
          </label>

          {selectedLanguages.map((langKey) => {
            const lang = apiLanguages.find((l) => l.key === langKey);
            if (!lang) return null;

            return (
              <label
                key={langKey}
                className={`inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-all border ${
                  activeLanguage === langKey
                    ? 'bg-bbb border-bbb text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  checked={activeLanguage === langKey}
                  onChange={() => setActiveLanguage(langKey)}
                  className="sr-only"
                />
                <span className="font-medium">{label} ({lang.key.toUpperCase()})</span>
                {isFieldValid(langKey) && (
                  <CheckIcon className={`h-3 w-3 ml-1 ${activeLanguage === langKey ? 'text-white' : 'text-green-600'}`} />
                )}
              </label>
            );
          })}
        </div>
      )}

      {label && !hasSelectedOtherLanguages && <label className="fieldLabel">{label}</label>}
      <div className="form-group py-2 h-[190px]">
        <div ref={quillRef} />
      </div>
    </div>
  );
};