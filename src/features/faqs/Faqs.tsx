import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { FaqsList } from './components/FaqsList';
import { CreateFaq } from './components/CreateFaq';
import { useUserStore } from '@/stores/user';

export const Faqs = () => {
  const { setCurrentPage } = useUserStore();
  useEffect(() => {
    setCurrentPage("faqs");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateFaq/>
      </div>
      <div className="mt-4">
        <FaqsList />
      </div>
    </ContentLayout>
  );
};
