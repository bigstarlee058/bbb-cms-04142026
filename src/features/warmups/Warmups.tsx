import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { WarmupList } from './components/WarmupList';
import { CreateWarmUp } from './components/CreateWarmup';

import { useQuery } from 'react-query';
import { fetchEquipmentTitles } from '../workouts/api';
import { useUserStore } from '@/stores/user';

export const Warmups = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );

  useEffect(() => {
    setCurrentPage("warmups");
  }, []);

  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateWarmUp titles={titles}/>
      </div>
      <div className="mt-4">
        <WarmupList />
      </div>
    </ContentLayout>
  );
};
