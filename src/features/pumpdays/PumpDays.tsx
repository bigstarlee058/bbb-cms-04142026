import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { PumpDayList } from './PumpDayList';
import { useUserStore } from '@/stores/user';

export const PumpDays = () => {
  const { setCurrentPage } = useUserStore();

  useEffect(() => {
    setCurrentPage("pumpdays");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="mt-4">
        <PumpDayList />
      </div>
    </ContentLayout>
  );
};
