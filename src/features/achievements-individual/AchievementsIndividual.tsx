import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsIndividual } from './components/CreateAchievementsIndividual';
import { AchievementsIndividualList } from './components/AchievementsIndividualList';
import { fetchAchievementsTargetTitles, fetchTagTitles } from '../workouts/api';
import { useQuery } from 'react-query';
import { useUserStore } from '@/stores/user';
import { useEffect } from 'react';

export const AchievementsIndividual = () => {
  const { setCurrentPage } = useUserStore();
  const { data: othertitles } = useQuery('get-other-titles', () =>
    fetchAchievementsTargetTitles({ filterString: '' })
  );

  const { data: tagtitles } = useQuery('get-tags-titles', () =>
    fetchTagTitles({ filterString: '' })
  );

  useEffect(() => {
    setCurrentPage("achievements-individual");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateAchievementsIndividual tagtitles = {tagtitles} othertitles={othertitles}/>
      </div>
      <div className="mt-4">
        <AchievementsIndividualList tagtitles = {tagtitles} othertitles={othertitles}/>
      </div>
    </ContentLayout>
  );
};
