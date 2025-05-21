import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsIndividual } from './components/CreateAchievementsIndividual';
import { AchievementsIndividualList } from './components/AchievementsIndividualList';

export const AchievementsIndividual = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateAchievementsIndividual />
      </div>
      <div className="mt-4">
        <AchievementsIndividualList />
      </div>
    </ContentLayout>
  );
};
