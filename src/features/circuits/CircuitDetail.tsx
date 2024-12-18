import { ContentLayout } from '@/components/Layout';
import { useNotificationStore } from '@/stores/notifications';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '@/types';
import { Spinner } from '@/components/Elements';
import { Head } from '@/components/Head';
import { formatDate } from '@/utils/format';
import { fetchCircuit } from './api';
import { fetchExerciseTitles } from '../workouts/api';

export const CircuitDetail = () => {
  const { circuitId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['get-circuit', circuitId], () => fetchCircuit(circuitId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
      navigate('/app/circuits');
    }
  });

  const { data: titles } = useQuery('get-exercises', () => fetchExerciseTitles({ filterString: '' }));

  const getExercise = (exerciseId: string) => {
    return titles?.find((exercise) => exercise.id === exerciseId);
  };

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
        <div className='flex flex-col'>
          {data.exercises.map((exercise) => (
            <span className="text-xs font-bold">{getExercise(exercise.exerciseId)?.title}</span>
          ))}
        </div>
        <span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
      </ContentLayout>
    </>
  );
};
