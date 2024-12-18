import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { CircuitsList } from './components/CircuitsList';
import { CreateCircuit } from './components/CreateCircuit';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchExerciseTitles } from '../workouts/api';

export const Circuits = () => {
  const { setCurrentPage } = useUserStore();

  const { data: titles } = useQuery('get-exercises', () => fetchExerciseTitles({ filterString: '' }));

  useEffect(() => {
    setCurrentPage('circuits');
  }, []);
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateCircuit titles={titles} />
      </div>
      <div className="mt-4">
        <CircuitsList titles={titles} />
      </div>
    </ContentLayout>
  );
};
