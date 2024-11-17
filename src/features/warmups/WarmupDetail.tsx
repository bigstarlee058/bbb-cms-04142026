import { ContentLayout } from '@/components/Layout';
import { useNotificationStore } from '@/stores/notifications';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '@/types';
import { Spinner } from '@/components/Elements';
import { Head } from '@/components/Head';
import { fetchWarmup } from './api';
import { fetchEquipmentTitles } from '../workouts/api';
import Vimeo from '@u-wave/react-vimeo';

export const WarmupDetail = () => {
  const { warmupId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['get-warmup', warmupId], () => fetchWarmup(warmupId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'error',
        title: err.message,
      });
      navigate('/app/warmups');
    },
  });
  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );

  if (isLoading || !data) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head title={data.title} />
      <ContentLayout title={data.title}>
        <div className="mt-6 flex flex-col space-y-16">
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <Vimeo className="w-full mt-3" video={data.vimeoId} autoplay={false} />
                <p className="font-bold">Description</p>
                <p>{data.description}</p>
                <p className="font-bold">Equipment</p>
                {titles ? (
                 titles.filter(title => data.equipments.includes(title.id)).map(title => title.title).join(', ')
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
