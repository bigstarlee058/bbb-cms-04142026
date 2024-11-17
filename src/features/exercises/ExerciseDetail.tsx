import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchExercise } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage } from '@/types';
import { fetchCategoryTitles, fetchExerciseTitles } from '../workouts/api';
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

  const { data: exerciseTitles } = useQuery('get-exercise-titles', () =>
    fetchExerciseTitles({ filterString: '' })
  );
  const { data: categoryTitles } = useQuery('get-category-titles', () =>
    fetchCategoryTitles({ filterString: '' })
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
                <p className="font-bold">Categories</p>
                {categoryTitles ? (
                 categoryTitles.filter(title => data.categories.includes(title.id)).map(title => title.title).join(', ')
                ) : null}
                <p className="font-bold">Description</p>
                <p>{data.description}</p>
                <p className="font-bold">Guide</p>
                <p>{data.guide}</p>
                <p className="font-bold">Related Exercises</p>
                {exerciseTitles ? (
                 exerciseTitles.filter(title => data.relatedExercises.includes(title.id)).map(exercise => exercise.title).join(', ')
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
