import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import Vimeo from '@u-wave/react-vimeo';

import { Spinner, Button } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { ErrorMessage } from '@/types';
import { fetchVersion } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { UpdateVersion } from './UpdateVersion';

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
    <>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex justify-end">
          <UpdateVersion screenData={data} />
        </div>
      </div>
      
      <ContentLayout title="New Version Update Detail">
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-hidden sm:rounded-lg">
            {/* {data.description} */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Updated Version : {data.latest_version}</h3>
              <p className="text-gray-600">{data.update_message}</p>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
