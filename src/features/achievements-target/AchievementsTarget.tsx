import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsTarget } from './componets/CreateAchievementsTarget';
import { AchievementsTargetsList } from './componets/AchievementsTargetsList';

export const AchievementsTarget = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateAchievementsTarget />
      </div>
      <div className="mt-4">
        <AchievementsTargetsList />
      </div>
    </ContentLayout>
  );
};