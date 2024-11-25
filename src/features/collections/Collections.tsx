import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';

import { CreateCollection } from './components/CreateCollection';
import { CollectionsList } from './components/CollectionsList';
import { useUserStore } from '@/stores/user';

export const Collections = () => {
  const { setCurrentPage } = useUserStore();

  useEffect(() => {
    setCurrentPage("equipments");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateCollection />
      </div>
      <div className="mt-4 max-w-8xl">
        <CollectionsList />
      </div>
    </ContentLayout>
  );
};
