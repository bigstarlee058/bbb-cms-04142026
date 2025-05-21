import { ContentLayout } from '@/components/Layout';
import { CreateAchievementsGroup } from './components/CreateAchievementsGroup';
import { AchievementsGroupList } from './components/AchievementsGroupList';

export const AchievementsGroup = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateAchievementsGroup />
      </div>
      <div className="mt-4">
        <AchievementsGroupList />
      </div>
    </ContentLayout>
  );
};
