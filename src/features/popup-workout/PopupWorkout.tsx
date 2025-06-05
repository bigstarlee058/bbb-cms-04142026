import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import Vimeo from '@u-wave/react-vimeo';

import { Spinner, Button } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { ErrorMessage } from '@/types';
import { fetchPopupInfo } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { UpdatePopupWorkout } from './UpdatePopupWorkout';

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
  console.log(data);
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
          <UpdatePopupWorkout screenData={data} />
        </div>
      </div>
      <ContentLayout title="Popup Modal Background Video">
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-hidden sm:rounded-lg">
            {data.vimeoId && data.vimeoId != "" &&
              <Vimeo className="h-full w-full" video={data.vimeoId} autoplay={false} />
            }
          </div>
        </div>
      </ContentLayout>
      <ContentLayout title="Popup Modal Note">
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-hidden sm:rounded-lg">
            {/* {data.description} */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-md font-semibold text-gray-800 mb-2">{data.title}</h3>
              <p className="text-gray-600">{data.description}</p>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
