import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { StaffsList } from './components/StaffsList';
import { CreateStaff } from './components/CreateStaff';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchEquipmentTitles } from '../workouts/api';

export const Staffs = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );
  useEffect(() => {
    setCurrentPage("staffs");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateStaff/>
      </div>
      <div className="mt-4">
        <StaffsList />
      </div>
    </ContentLayout>
  );
};
