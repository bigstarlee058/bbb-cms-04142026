import { ContentLayout } from '@/components/Layout';
import { useNotificationStore } from '@/stores/notifications';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '@/types';
import { Spinner } from '@/components/Elements';
import { Head } from '@/components/Head';
import { formatDate } from '@/utils/format';
import { fetchPumpDay } from './api';

export const PumpDayDetail = () => {
  const { pumpDayId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['get-pump-day', pumpDayId], () => fetchPumpDay(pumpDayId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
      navigate('/app/pump-days');
    }
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
      <Head title={data.title} />
      <ContentLayout title={data.title}>
        <span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
        <div>
          <span className="text-xs font-bold">{data.description}</span>
        </div>
      </ContentLayout>
    </>
  );
};
