import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { Spinner, MDPreview } from '@/components/Elements';
import { Head } from '@/components/Head';
import { ContentLayout } from '@/components/Layout';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage } from '@/types';
import { formatDate } from '@/utils/format';

import { fetchEquipment } from './api';
import { UpdateEquipment } from './components/UpdateEquipment';
export const EquipmentDetail = () => {
  const { equipmentId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    ['get-equipment', equipmentId],
    () => fetchEquipment(equipmentId),
    {
      onError: (err: ErrorMessage) => {
        addNotification({
          type: 'success',
          title: err.message,
        });
        navigate('/app/equipment');
      },
    }
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
        <span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex justify-end">
            <UpdateEquipment equipmentId={equipmentId} />
          </div>
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex gap-3">
                  <div>
                    <img src={data.thumbnail} alt="Thumbnail" />
                  </div>
                  <div>
                    <MDPreview value={'Price: $' + data.price} />
                    <a href={data.link} target="_blank" rel="noreferrer">
                      Visit Product
                    </a>
                  </div>
                </div>

                <div className="mt-5 max-w-2xl text-sm text-gray-500">
                  <MDPreview value={data.title + ' Equipment with id = ' + data._id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
