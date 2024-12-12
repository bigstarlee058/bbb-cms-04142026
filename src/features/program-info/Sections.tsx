import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { SectionsList } from './components/SectionsList';
import { CreateSection } from './components/CreateSection';
import { useUserStore } from '@/stores/user';

export const Sections = () => {
  const { setCurrentPage } = useUserStore();
  useEffect(() => {
    setCurrentPage("sections");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateSection/>
      </div>
      <div className="mt-4">
        <SectionsList />
      </div>
    </ContentLayout>
  );
};
