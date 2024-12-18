import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { PumpDaysList } from './components/PumpDaysList';
import { CreatePumpDay } from './components/CreatePumpDay';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchCircuitTitles } from '../circuits/api';

export const PumpDays = () => {
  const { setCurrentPage } = useUserStore();

    const { data: titles } = useQuery('get-circuit-titles', () =>
      fetchCircuitTitles({ filterString: '' })
    );

  useEffect(() => {
    setCurrentPage("sections");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreatePumpDay titles={titles}/>
      </div>
      <div className="mt-4">
        <PumpDaysList titles={titles} />
      </div>
    </ContentLayout>
  );
};
