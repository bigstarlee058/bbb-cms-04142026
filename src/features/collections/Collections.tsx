import { ContentLayout } from '@/components/Layout';
import { CreateCollection } from './components/CreateCollection';
import { CollectionsList } from './components/CollectionsList';

export const Collections = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateCollection />
      </div>
      <div className="mt-4">
        <CollectionsList />
      </div>
    </ContentLayout>
  );
};
