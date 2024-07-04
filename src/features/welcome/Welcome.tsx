import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import Vimeo from '@u-wave/react-vimeo';

import { Spinner, MDPreview } from '@/components/Elements';
import { Head } from '@/components/Head';
import { ContentLayout } from '@/components/Layout';
import { formatDate } from '@/utils/format';
import { ErrorMessage } from '@/types';
import { fetchIntro } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { UpdateIntro } from './UpdateIntro';

export const Welcome = () => {
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery('get-intro', () => fetchIntro(), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message,
      });
    },
  });
  if (isLoading || !data) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head title="Introduction Video" />
      <ContentLayout title="Welcome Screen Video">
        <span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex justify-end">
            <UpdateIntro />
          </div>
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="mt-1 max-w-2xl text-sm text-gray-500">
                  <Vimeo className="w-full" video={data.vimeoId} autoplay={false} />
                  <MDPreview value={`Vimeo ID = ${data.vimeoId} with item id = ${data._id}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
