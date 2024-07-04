import { useNavigate, useParams } from 'react-router-dom';
import { Spinner, MDPreview } from '@/components/Elements';
import { Head } from '@/components/Head';
import { ContentLayout } from '@/components/Layout';
import { formatDate } from '@/utils/format';
import { UpdateExercise } from './components/UpdateExercise';
import { useQuery } from 'react-query';
import { fetchExercise } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage, Tag } from '@/types';
import Vimeo from '@u-wave/react-vimeo';

export const ExerciseDetail = () => {
  const { exerciseId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery('get-exercise', () => fetchExercise(exerciseId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message,
      });
      navigate('/app/exercises');
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
      <Head title={data.title} />
      <ContentLayout title={data.title}>
        <span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
        <div className="mt-6 flex flex-col space-y-16">
          <div className="flex justify-end">
            <UpdateExercise exerciseId={exerciseId} />
          </div>
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex gap-3">
                  <div>
                    <img src={data.thumbnail} />
                  </div>
                </div>
                <Vimeo className="w-full mt-3" video={data.vimeoId} autoplay={false} />

                <div className="mt-5 max-w-2xl text-sm text-gray-500">
                  <MDPreview value={data.title + ' Exercise with id = ' + data._id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
