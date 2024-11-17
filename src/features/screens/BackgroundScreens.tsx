import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import Vimeo from '@u-wave/react-vimeo';
import { Spinner, Button } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { ErrorMessage } from '@/types';
import { fetchScreens } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { UpdateScreens } from './UpdateScreens';

export const BackgroundScreens = () => {
  const { addNotification } = useNotificationStore();
  const { data, isLoading, error } = useQuery('get-screens', fetchScreens, {
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
          <UpdateScreens screenData={data} />
        </div>
      </div>
      <ContentLayout title="Login Screen 1 Background Video">
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <Vimeo className="h-full w-full" video={data.vimeoId} autoplay={false} />
          </div>
        </div>
      </ContentLayout>
      <ContentLayout title="Login Screen 1 Welcome Note">
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-hidden sm:rounded-lg">
            {data.description}
          </div>
        </div>
      </ContentLayout>
      <ContentLayout title="Login Screen 2 Background Picture">
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imgUrl} alt="Thumbnail" />
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
