import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';

import { CreateEquipment } from './components/CreateEquipment';
import { EquipmentList } from './components/EquipmentList';
import { useUserStore } from '@/stores/user';

export const Equipments = () => {
  const { setCurrentPage } = useUserStore();

  useEffect(() => {
    setCurrentPage("equipments");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateEquipment />
      </div>
      <div className="mt-4 max-w-8xl">
        <EquipmentList />
      </div>
    </ContentLayout>
  );
};
