import { ContentLayout } from '@/components/Layout';
import { CreateExercise } from './components/CreateExercise';
import { ExercisesList } from './components/ExercisesList';

export const Exercises = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateExercise />
      </div>
      <div className="mt-4">
        <ExercisesList />
      </div>
    </ContentLayout>
  );
};
