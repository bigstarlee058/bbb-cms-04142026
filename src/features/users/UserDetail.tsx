import { useNavigate, useParams } from 'react-router-dom';
import { Spinner, MDPreview } from '@/components/Elements';
import { Head } from '@/components/Head';
import { ContentLayout } from '@/components/Layout';
import { formatDate } from '@/utils/format';
import { UpdateUser } from './components/UpdateUser';
import { useQuery } from 'react-query';
import { fetchUser } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage, Tag } from '@/types';
import { isEmpty } from '@/utils';

export const UserDetail = () => {
  const { userId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery('get-user', () => fetchUser(userId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message,
      });
      navigate('/app/users');
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
      <Head title={data.email} />
      <ContentLayout title={data.email}>
        <span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex justify-end"></div>
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="mt-5 max-w-2xl text-sm text-gray-500">
                  <MDPreview value={data.firstname + ' ' + data.lastname} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
