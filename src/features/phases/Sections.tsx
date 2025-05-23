import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { SectionsList } from './components/SectionsList';
import { CreateSection } from './components/CreateSection';
import { EditMainInfo } from './components/EditMainInfo';
import { useUserStore } from '@/stores/user';

export const Sections = () => {
  const { setCurrentPage } = useUserStore();
  useEffect(() => {
    setCurrentPage("sections");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <EditMainInfo/>
        <div className='w-3'/>
        <CreateSection/>
      </div>
      <div className="mt-4">
        <SectionsList />
      </div>
    </ContentLayout>
  );
};
