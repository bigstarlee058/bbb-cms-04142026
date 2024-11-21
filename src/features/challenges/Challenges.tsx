import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { ChallengesList } from './components/ChallengesList';
import { CreateChallenge } from './components/CreateChallenge';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchEquipmentTitles } from '../workouts/api';

export const Challenges = () => {
  const { setCurrentPage } = useUserStore();
  const { data: titles } = useQuery('get-equipment-titles', () =>
    fetchEquipmentTitles({ filterString: '' })
  );
  useEffect(() => {
    setCurrentPage("challenges");
  }, []);
  
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateChallenge/>
      </div>
      <div className="mt-4">
        <ChallengesList />
      </div>
    </ContentLayout>
  );
};
