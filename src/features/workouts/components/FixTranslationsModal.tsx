import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useFixTranslationsStore } from '@/stores/fixTranslations';
import { TranslationUpdateData, updateExerciseTranslations } from '../api';
import { CheckIcon } from '@heroicons/react/solid';
import { XIcon } from '@heroicons/react/outline';
import { useLanguageStore } from '@/stores/languages';

export const FixTranslationsModal = () => {
  const queryClient = useQueryClient();
  const { isOpen, exerciseId, selectedTitleData, selectedLanguages, thumbnail, close } =
    useFixTranslationsStore();
  const apiLanguages = useLanguageStore((state) => state.languages);

  const [fixFormData, setFixFormData] = useState<TranslationUpdateData>({
    titleTranslations: {},
    vimeoIdTranslations: {}
  });

  const [activeTitleLang, setActiveTitleLang] = useState<string>('');
  const [activeVimeoLang, setActiveVimeoLang] = useState<string>('');
  const [titleProblemLangs, setTitleProblemLangs] = useState<string[]>([]);
  const [vimeoProblemLangs, setVimeoProblemLangs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && selectedTitleData) {
      const initialTitleTranslations = selectedTitleData.titleTranslations
        ? { ...selectedTitleData.titleTranslations }
        : {};
      const initialVimeoTranslations = selectedTitleData.vimeoIdTranslations
        ? { ...selectedTitleData.vimeoIdTranslations }
        : {};

      setFixFormData({
        titleTranslations: initialTitleTranslations,
        vimeoIdTranslations: initialVimeoTranslations
      });

      const titleProblems = selectedLanguages.filter((lang) => {
        const val = initialTitleTranslations[lang];
        return !val || val.trim() === '' || val === selectedTitleData.title;
      });

      const vimeoProblems = selectedLanguages.filter((lang) => {
        const val = initialVimeoTranslations[lang];
        return !val || val.trim() === '' || val === selectedTitleData.vimeoId;
      });

      setTitleProblemLangs(titleProblems);
      setVimeoProblemLangs(vimeoProblems);
      setActiveTitleLang(titleProblems[0] || '');
      setActiveVimeoLang(vimeoProblems[0] || '');
    }
  }, [isOpen, selectedTitleData, selectedLanguages]);

  const fixMutation = useMutation(
    (data: TranslationUpdateData) => updateExerciseTranslations(exerciseId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('get-exercise-titles');
        close();
      }
    }
  );

  const handleFixFormChange = (
    lang: string,
    field: keyof TranslationUpdateData,
    value: string
  ) => {
    setFixFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  const getFieldStatus = (lang: string, field: 'title' | 'vimeoId') => {
    if (!selectedTitleData) return null;

    if (field === 'title') {
      const val = fixFormData.titleTranslations[lang];
      if (!val || val.trim() === '') return 'blank';
      if (val === selectedTitleData.title) return 'same';
      return 'valid';
    }

    const val = fixFormData.vimeoIdTranslations[lang];
    if (!val || val.trim() === '') return 'blank';
    if (val === selectedTitleData.vimeoId) return 'same';
    return 'valid';
  };

  const hasAllValid = () => {
    const titleValid = titleProblemLangs.every((lang) => getFieldStatus(lang, 'title') === 'valid');
    const vimeoValid = vimeoProblemLangs.every((lang) => getFieldStatus(lang, 'vimeoId') === 'valid');
    return titleValid && vimeoValid;
  };

  if (!isOpen || !selectedTitleData) return null;

  const titleStatus = activeTitleLang ? getFieldStatus(activeTitleLang, 'title') : null;
  const vimeoStatus = activeVimeoLang ? getFieldStatus(activeVimeoLang, 'vimeoId') : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-[520px] max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-xs text-gray-400 font-medium uppercase">Update Exercise</h4>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="p-1 rounded hover:bg-gray-200 transition-colors self-start"
          >
            <XIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ backgroundColor: '#f8f8f8' }}>
          <h3 className="text-base font-bold text-gray-800 mr-4">
            {selectedTitleData.title}
          </h3>
          {thumbnail && (
            <img
              src={thumbnail}
              alt={selectedTitleData.title}
              className="rounded-md object-cover border border-gray-200 flex-shrink-0"
              style={{ width: '80px', height: '80px' }}
            />
          )}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-3 space-y-3">
          {titleProblemLangs.length > 0 && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2">
                {titleProblemLangs.map((langKey) => {
                  const lang = apiLanguages.find((l) => l.key === langKey);
                  if (!lang) return null;
                  const isValid = getFieldStatus(langKey, 'title') === 'valid';
                  return (
                    <label
                      key={langKey}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-all border ${activeTitleLang === langKey
                        ? 'bg-bbb border-bbb text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        checked={activeTitleLang === langKey}
                        onChange={() => setActiveTitleLang(langKey)}
                        className="sr-only"
                      />
                      <span className="font-medium">Title ({lang.key.toUpperCase()})</span>
                      {isValid && (
                        <CheckIcon
                          className={`h-3 w-3 ml-1 ${activeTitleLang === langKey ? 'text-white' : 'text-green-600'
                            }`}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border text-sm text-gray-800 focus:outline-none"
                style={{
                  borderColor: titleStatus === 'valid' ? '#48948C' : '#dc2626'
                }}
                value={fixFormData.titleTranslations[activeTitleLang] || ''}
                onChange={(e) =>
                  handleFixFormChange(activeTitleLang, 'titleTranslations', e.target.value)
                }
                placeholder={`Title in ${activeTitleLang.toUpperCase()}`}
              />
              {titleStatus === 'blank' && (
                <p className="text-xs font-medium text-red-600">Title translation is missing</p>
              )}
              {titleStatus === 'same' && (
                <p className="text-xs font-medium text-red-600">Title is the same as English</p>
              )}
            </div>
          )}

          {vimeoProblemLangs.length > 0 && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2">
                {vimeoProblemLangs.map((langKey) => {
                  const lang = apiLanguages.find((l) => l.key === langKey);
                  if (!lang) return null;
                  const isValid = getFieldStatus(langKey, 'vimeoId') === 'valid';
                  return (
                    <label
                      key={langKey}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-all border ${activeVimeoLang === langKey
                        ? 'bg-bbb border-bbb text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        checked={activeVimeoLang === langKey}
                        onChange={() => setActiveVimeoLang(langKey)}
                        className="sr-only"
                      />
                      <span className="font-medium">Vimeo ID ({lang.key.toUpperCase()})</span>
                      {isValid && (
                        <CheckIcon
                          className={`h-3 w-3 ml-1 ${activeVimeoLang === langKey ? 'text-white' : 'text-green-600'
                            }`}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border text-sm text-gray-800 focus:outline-none"
                style={{
                  borderColor: vimeoStatus === 'valid' ? '#48948C' : '#dc2626'
                }}
                value={fixFormData.vimeoIdTranslations[activeVimeoLang] || ''}
                onChange={(e) =>
                  handleFixFormChange(activeVimeoLang, 'vimeoIdTranslations', e.target.value)
                }
                placeholder={`Vimeo ID in ${activeVimeoLang.toUpperCase()}`}
              />
              {vimeoStatus === 'blank' && (
                <p className="text-xs font-medium text-red-600">Vimeo ID translation is missing</p>
              )}
              {vimeoStatus === 'same' && (
                <p className="text-xs font-medium text-red-600">Vimeo ID is the same as English</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={close}
            disabled={fixMutation.isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9a354e]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => fixMutation.mutate(fixFormData)}
            disabled={!hasAllValid() || fixMutation.isLoading}
            className={`px-6 py-2 text-sm font-medium text-white rounded-md shadow-sm ${!hasAllValid() || fixMutation.isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#9a354e] hover:bg-[#802a3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9a354e]'
              }`}
          >
            {fixMutation.isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};