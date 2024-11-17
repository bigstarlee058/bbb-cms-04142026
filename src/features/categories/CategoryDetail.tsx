import { ContentLayout } from '@/components/Layout';
import { useNotificationStore } from '@/stores/notifications';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '@/types';
import { Spinner } from '@/components/Elements';
import { Head } from '@/components/Head';
import { formatDate } from '@/utils/format';
import { fetchCategory } from './api';

export const CategoryDetail = () => {
  const { categoryId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['get-category', categoryId], () => fetchCategory(categoryId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
      navigate('/app/categories');
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
        <div className="mt-6 flex flex-col space-y-16">
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex gap-3">
                  <div>
                    <img src={data.thumbnail} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
