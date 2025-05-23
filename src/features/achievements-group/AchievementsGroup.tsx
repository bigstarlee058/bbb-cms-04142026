import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsGroup } from './components/CreateAchievementsGroup';
import { AchievementsGroupList } from './components/AchievementsGroupList';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchAchievementsIndividualTitles } from '../workouts/api';
import { useEffect } from 'react';

export const AchievementsGroup = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-collection-titles', () =>
    fetchAchievementsIndividualTitles({ filterString: '' })
  );

  useEffect(() => {
    setCurrentPage("achievements-group");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateAchievementsGroup titles={titles}/>
      </div>
      <div className="mt-4">
        <AchievementsGroupList titles={titles}/>
      </div>
    </ContentLayout>
  );
};
