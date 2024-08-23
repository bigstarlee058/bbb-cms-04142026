import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchExercise } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage } from '@/types';
import { fetchExerciseTitles } from '../workouts/api';
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

  const { data: titles } = useQuery('get-exercise-titles', () =>
    fetchExerciseTitles({ filterString: '' })
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
                <Vimeo className="w-full mt-3" video={data.vimeoId} autoplay={false} />
                {/* <div className="mt-5 max-w-2xl text-sm text-gray-500">
                  <MDPreview value={data.title + ' Exercise with id = ' + data._id} />
                </div> */}
                <p className="font-bold">Categories</p>
                <p>{data.categories}</p>
                <p className="font-bold">Description</p>
                <p>{data.description}</p>
                <p className="font-bold">Guide</p>
                <p>{data.guide}</p>
                <p className="font-bold">Related Exercises</p>
                {titles ? (
                 titles.filter(title => data.relatedExercises.includes(title.id)).map(exercise => exercise.title).join(', ')
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
