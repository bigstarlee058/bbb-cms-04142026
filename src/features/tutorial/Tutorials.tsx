import { ContentLayout } from '@/components/Layout';
import { CreateTutorial } from './components/CreateTutorial';
import { TutorialsList } from './components/TutorialsList';

export const Tutorials = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateTutorial />
      </div>
      <div className="mt-4">
        <TutorialsList />
      </div>
    </ContentLayout>
  );
};