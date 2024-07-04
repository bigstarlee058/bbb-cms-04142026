import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spinner, MDPreview } from '@/components/Elements';
import { Head } from '@/components/Head';
import { ContentLayout } from '@/components/Layout';
import { formatDate } from '@/utils/format';
import { UpdateTag } from './components/UpdateTag';
import { useQuery } from 'react-query';
import { fetchTag } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage, Tag } from '@/types';

export const TagDetail = () => {
  const { tagId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['get-tag', tagId], () => fetchTag(tagId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message,
      });
      navigate('/app/tags');
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
      <Head title={data.name} />
      <ContentLayout title={data.name}>
        *<span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex justify-end">
            <UpdateTag tagId={tagId} />
          </div>
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="mt-1 max-w-2xl text-sm text-gray-500">
                  <div className="flex flex-col text-lg">
                    {data.featuredCollections.map((v) => {
                      return <Link to={`/app/collections/${v._id}`}>{v.title}</Link>;
                    })}
                  </div>
                  <MDPreview value={data.name + ' with id = ' + data._id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
