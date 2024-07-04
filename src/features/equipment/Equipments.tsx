import { ContentLayout } from '@/components/Layout';

import { CreateEquipment } from './components/CreateEquipment';
import { EquipmentList } from './components/EquipmentList';

export const Equipments = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateEquipment />
      </div>
      <div className="mt-4">
        <EquipmentList />
      </div>
    </ContentLayout>
  );
};
