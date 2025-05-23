import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { SectionsList } from './components/SectionsList';
import { CreateSection } from './components/CreateSection';
import { EditMainInfo } from './components/EditMainInfo';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { fetchPhasesMainInfo } from './api';
import { ErrorMessage } from '@/types';
import { Spinner } from '@/components/Elements';

export const Sections = () => {
  const { addNotification } = useNotificationStore();
  const { setCurrentPage } = useUserStore();
  useEffect(() => {
    setCurrentPage("phases");
  }, []);

  const { data, isLoading, error } = useQuery('get-phasesmaininfo', fetchPhasesMainInfo, {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
    }
  });

  if (isLoading || !data) {    
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Handle the error properly
  }
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <EditMainInfo maininfoData={data}/>
        <div className='w-3'/>
        <CreateSection/>
      </div>
      <div className="mt-4">
        <SectionsList />
      </div>
    </ContentLayout>
  );
};
