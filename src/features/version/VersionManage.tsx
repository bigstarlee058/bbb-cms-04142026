import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { ErrorMessage } from '@/types';
import { fetchVersion } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { UpdateVersion } from './UpdateVersion';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';

export const VersionManage = () => {
  const { addNotification } = useNotificationStore();
  const { data, isLoading, error } = useQuery('get-version', fetchVersion, {
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
    translatableFields: ['update_message', 'update_title'],
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
    <>
      <ContentLayout title="">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          <div className="flex justify-between items-center">
            <h2>Version Management</h2>
            <div>
              {hasTranslations && (
                <LanguageSwitcher
                  availableLanguages={availableLanguages}
                  selectedLang={selectedLang}
                  onLanguageChange={setSelectedLang}
                />
              )}
            </div>
            <UpdateVersion screenData={data} />
          </div>
        </div>
        <div className="mt-1 flex flex-col space-y-2">
          {/* General Version Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">General Information</h4>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Update Title</h4>
                <p className="text-xl font-semibold text-gray-900">{getValue(data,'update_title')}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-700 mb-2">Update Message</h4>
                <p className="text-blue-900">{getValue(data,'update_message')}</p>
              </div>
            </div>
          </div>

          {/* Platform Specific Versions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Android Version */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Android</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Version</span>
                  <span className="text-xl font-semibold text-gray-900">{data.android.version}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Force Update</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium w-[100px] text-center ${data.android.forceUpdate
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                    }`}>
                    {data.android.forceUpdate ? 'Required' : 'Optional'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Show Popup</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium w-[100px] text-center ${data.android.showPopUp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {data.android.showPopUp ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* iOS Version */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">iOS</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Version</span>
                  <span className="text-xl font-semibold text-gray-900">{data.ios.version}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Force Update</span>
                  <span className={`px-3 py-1 rounded-full w-[100px] text-center text-sm font-medium ${data.ios.forceUpdate
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                    }`}>
                    {data.ios.forceUpdate ? 'Required' : 'Optional'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Show Popup</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium w-[100px] text-center ${data.ios.showPopUp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {data.ios.showPopUp ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
