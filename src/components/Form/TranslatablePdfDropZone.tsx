import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { CheckIcon, DocumentIcon, TrashIcon } from '@heroicons/react/solid';
import { getIn } from 'formik';

interface TranslatablePdfDropzoneProps {
  formik: any;
  name: string;
  translationField?: string;
  label: string;
  selectedLanguages: string[];
}

export const TranslatablePdfDropzone = ({
  formik,
  name,
  translationField = `${name}Translations`,
  label,
  selectedLanguages,
}: TranslatablePdfDropzoneProps) => {
  const apiLanguages = useLanguageStore((state) => state.languages);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (activeLanguage !== 'en' && !selectedLanguages.includes(activeLanguage)) {
      setActiveLanguage('en');
    }
  }, [selectedLanguages, activeLanguage]);

  const isFieldValid = (langKey: string) => {
    let value, error;
    if (langKey === 'en') {
      value = getIn(formik.values, name);
      error = getIn(formik.errors, name);
    } else {
      value = getIn(formik.values, `${translationField}.${langKey}`);
      error = getIn(formik.errors, `${translationField}.${langKey}`);
    }
    return !error && value && (typeof value === 'string' || value instanceof File);
  };

  const hasSelectedOtherLanguages = selectedLanguages.length > 0;

  const getCurrentValue = () => {
    if (activeLanguage === 'en') {
      return formik.values[name];
    }
    return getIn(formik.values, `${translationField}.${activeLanguage}`);
  };

  const getFileName = (value: any) => {
    if (!value) return '';
    if (value instanceof File) return value.name;
    if (typeof value === 'string') {
      const parts = value.split('/');
      return parts[parts.length - 1] || value;
    }
    return '';
  };

  const isFileUrl = (value: any) => {
    return typeof value === 'string' && value.length > 0;
  };

  const isValidPdf = (file: File): boolean => {
    return file.type === 'application/pdf';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidPdf(file)) {
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    if (!isValidPdf(file)) return;

    if (activeLanguage === 'en') {
      formik.setFieldValue(name, file);
    } else {
      formik.setFieldValue(`${translationField}.${activeLanguage}`, file);
    }
  };

  const handleDelete = () => {
    if (activeLanguage === 'en') {
      formik.setFieldValue(name, '');
      formik.setFieldValue('deletePdf', true);
    } else {
      formik.setFieldValue(`${translationField}.${activeLanguage}`, '');
      const deleteField = `delete${translationField.charAt(0).toUpperCase() + translationField.slice(1)}`;
      const currentDeleteState = formik.values[deleteField] || {};
      formik.setFieldValue(deleteField, {
        ...currentDeleteState,
        [activeLanguage]: true,
      });
    }
  };

  const currentValue = getCurrentValue();
  const hasFile = currentValue && (typeof currentValue === 'string' || currentValue instanceof File);
  const fileName = getFileName(currentValue);

  const renderLanguageTabs = () => (
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
          <CheckIcon
            className={`h-3 w-3 ml-1 ${
              activeLanguage === 'en' ? 'text-white' : 'text-green-600'
            }`}
          />
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
            <span className="font-medium">
              {label} ({lang.key.toUpperCase()})
            </span>
            {isFieldValid(langKey) && (
              <CheckIcon
                className={`h-3 w-3 ml-1 ${
                  activeLanguage === langKey ? 'text-white' : 'text-green-600'
                }`}
              />
            )}
          </label>
        );
      })}
    </div>
  );

  const renderPdfPreview = () => (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            <DocumentIcon className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
            <p className="text-xs text-gray-500 uppercase">PDF Document</p>
            {isFileUrl(currentValue) && (
              <a
                href={currentValue}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-600 hover:text-red-800 hover:underline"
              >
                View File
              </a>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        dragActive 
          ? 'border-red-500 bg-red-50' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <DocumentIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600 mb-3">
        Drag and drop a PDF file here, or click to select
      </p>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && isValidPdf(file)) {
            handleFileChange(file);
          }
          e.target.value = '';
        }}
        className="hidden"
        id={`pdf-upload-${name}-${activeLanguage}`}
      />
      <label
        htmlFor={`pdf-upload-${name}-${activeLanguage}`}
        className="inline-block px-4 py-2 bg-red-600 text-white text-sm rounded-md cursor-pointer hover:bg-red-700 transition-colors"
      >
        Select PDF
      </label>
    </div>
  );

  return (
    <div className="mb-4">
      {hasSelectedOtherLanguages && renderLanguageTabs()}
      
      {!hasSelectedOtherLanguages && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      {hasFile ? renderPdfPreview() : renderEmptyState()}
    </div>
  );
};