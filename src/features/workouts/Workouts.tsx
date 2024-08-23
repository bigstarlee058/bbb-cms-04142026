import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { WorkoutList } from './components/WorkoutList';
import { useUserStore } from '@/stores/user';

export const Workouts = () => {
  const { setCurrentPage } = useUserStore();

  useEffect(() => {
    setCurrentPage("workouts");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="mt-4">
        <WorkoutList />
      </div>
    </ContentLayout>
  );
};
