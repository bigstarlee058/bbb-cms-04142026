import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { CreateExercise } from './components/CreateExercise';
import { ExercisesList } from './components/ExercisesList';
import { fetchCategoryTitles, fetchEquipmentTitles, fetchExerciseTitles } from '../workouts/api';
import { useQuery } from 'react-query';
import { useUserStore } from '@/stores/user';

export const Exercises = () => {
  const { data: exerciseTitles } = useQuery('get-exercise-titles', () =>
    fetchExerciseTitles({ filterString: '' })
  );

  const { data: equipmentTitles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );

  const { data: categoryTitles } = useQuery('get-category-titles', () =>
    fetchCategoryTitles({ filterString: '' })
  );

  const { setCurrentPage } = useUserStore();

  useEffect(() => {
    setCurrentPage("equipments");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateExercise exerciseTitles={exerciseTitles} equipmentTitles={equipmentTitles} categoryTitles={categoryTitles}/>
      </div>
      <div className="mt-4">
        <ExercisesList />
      </div>
    </ContentLayout>
  );
};
