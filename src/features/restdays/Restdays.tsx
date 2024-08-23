import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { RestdayList } from './components/RestdayList';
import { CreateRestday } from './components/CreateRestday';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchEquipmentTitles } from '../workouts/api';

export const Restdays = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );
  useEffect(() => {
    setCurrentPage("restdays");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateRestday titles={titles}/>
      </div>
      <div className="mt-4">
        <RestdayList />
      </div>
    </ContentLayout>
  );
};
