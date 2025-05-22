import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsIndividual } from './components/CreateAchievementsIndividual';
import { AchievementsIndividualList } from './components/AchievementsIndividualList';
import { fetchAchievementsTargetTitles } from '../workouts/api';
import { useQuery } from 'react-query';
import { useUserStore } from '@/stores/user';
import { useEffect } from 'react';

export const AchievementsIndividual = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-collection-titles', () =>
    fetchAchievementsTargetTitles({ filterString: '' })
  );

  useEffect(() => {
    setCurrentPage("achievements-individual");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateAchievementsIndividual titles={titles}/>
      </div>
      <div className="mt-4">
        <AchievementsIndividualList titles={titles}/>
      </div>
    </ContentLayout>
  );
};
