import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { CreateExercise } from './components/CreateExercise';
import { ExercisesList } from './components/ExercisesList';
import { fetchExerciseTitles } from '../workouts/api';
import { useQuery } from 'react-query';
import { useUserStore } from '@/stores/user';

export const Exercises = () => {
  const { data: titles } = useQuery('get-exercise-titles', () =>
    fetchExerciseTitles({ filterString: '' })
  );

  const { setCurrentPage } = useUserStore();

  useEffect(() => {
    setCurrentPage("equipments");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateExercise titles={titles}/>
      </div>
      <div className="mt-4">
        <ExercisesList />
      </div>
    </ContentLayout>
  );
};
