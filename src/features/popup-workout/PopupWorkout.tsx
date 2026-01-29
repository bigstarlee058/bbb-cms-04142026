import { useQuery } from 'react-query';
import Vimeo from '@u-wave/react-vimeo';

import { Spinner } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { ErrorMessage } from '@/types';
import { fetchPopupInfo } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { UpdatePopupWorkout } from './UpdatePopupWorkout';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
export const PopupWorkout = () => {
  const { addNotification } = useNotificationStore();
  const { data, isLoading, error } = useQuery('get-popupworkout', fetchPopupInfo, {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
    }
  });
  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data ? [data] : [],
    translatableFields: ['title', 'description', 'vimeoId'],
  });
  if (isLoading || !data) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Handle the error properly
  }

  return (
    <ContentLayout title="">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex justify-between items-center">
          <h2>Workout Frequency</h2>
          <div>
            {hasTranslations && (
              <LanguageSwitcher
                availableLanguages={availableLanguages}
                selectedLang={selectedLang}
                onLanguageChange={setSelectedLang}
              />
            )}
          </div>
          <UpdatePopupWorkout screenData={data} />
        </div>
      </div>
      <div className="mt-2 flex flex-row gap-4">
        <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-hidden sm:rounded-lg w-1/2">
          {data.vimeoId && data.vimeoId !== "" && (
            <Vimeo className="h-full w-full" video={getValue(data, "vimeoId")} autoplay={false} />
          )}
        </div>

        <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-hidden sm:rounded-lg w-1/2">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-md font-semibold text-gray-800 mb-2">{getValue(data, 'title')}</h3>
            <span
              dangerouslySetInnerHTML={{
                __html: getValue(data, 'description'),
              }}
            />
          </div>
        </div>
      </div>

    </ContentLayout>
  );
};
