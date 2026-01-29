import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { ErrorMessage } from '@/types';
import { fetchPopupNewJoin } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { UpdatePopupNewJoin } from './UpdatePopupNewJoin';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { Button } from '@/components/Elements';
export const PopupNewJoin = () => {
  const { addNotification } = useNotificationStore();
  const { data, isLoading, error } = useQuery('get-popupnewjoin', fetchPopupNewJoin, {
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
    translatableFields: ['title', 'description', 'buttonText', 'imgUrl'],
  });

  if (isLoading || !data) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ContentLayout title="">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex justify-between items-center">
          <h2>Popup New Join Users</h2>
          <div>
            {hasTranslations && (
              <LanguageSwitcher
                availableLanguages={availableLanguages}
                selectedLang={selectedLang}
                onLanguageChange={setSelectedLang}
              />
            )}
          </div>
          <UpdatePopupNewJoin screenData={data} />
        </div>
      </div>

      <div className="mt-2 flex flex-col space-y-16">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5 flex items-center justify-center bg-gray-100 p-8">
              <img
                className="max-h-[300px] w-auto object-contain rounded-lg shadow-md"
                src={getValue(data, 'imgUrl')}
                alt="Popup Preview"
              />
            </div>
            <div className="md:w-3/5 flex flex-col justify-center p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {getValue(data, 'title')}
              </h2>
              <div
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: getValue(data, 'description'),
                }}
              />
              <div className="pt-4">
                <Button size="sm" variant="danger">
                  {getValue(data, 'buttonText') || 'Get Started'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};