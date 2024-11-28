import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';

import { CreateBonus } from './components/CreateBonus';
import { BonusesList } from './components/BonusesList';
import { useUserStore } from '@/stores/user';

export const Bonuses = () => {
  const { setCurrentPage } = useUserStore();

  useEffect(() => {
    setCurrentPage("bonuses");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateBonus />
      </div>
      <div className="mt-4 max-w-8xl">
        <BonusesList />
      </div>
    </ContentLayout>
  );
};
