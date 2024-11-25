import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';

import { CreateEquipment } from './components/CreateEquipment';
import { EquipmentList } from './components/EquipmentList';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchCollectionTitles } from '../workouts/api';

export const Equipments = () => {
  const { setCurrentPage } = useUserStore();

  const { data: titles } = useQuery('get-collection-titles', () =>
    fetchCollectionTitles({ filterString: '' })
  );

  useEffect(() => {
    setCurrentPage("equipments");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateEquipment titles={titles}/>
      </div>
      <div className="mt-4 max-w-8xl">
        <EquipmentList />
      </div>
    </ContentLayout>
  );
};
