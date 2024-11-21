import { ContentLayout } from '@/components/Layout';
import { useNotificationStore } from '@/stores/notifications';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage, User } from '@/types';
import { Spinner } from '@/components/Elements';
import { Head } from '@/components/Head';
import { formatDate } from '@/utils/format';
import { fetchChallenge } from './api';

export const ChallengeDetail = () => {
  const { challengeId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['get-challenge', challengeId], () => fetchChallenge(challengeId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
      navigate('/app/challenges');
    }
  });

  if (isLoading || !data) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <>
      <Head title={data.title} />
      <ContentLayout title={data.title}>
        <span className="text-xs font-bold">{formatDate(data.createdAt)}</span>
        <div className="mt-6 flex flex-col space-y-16">
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex gap-3">
                  <div>
                    <img src={data.photo} />
                  </div>
                  <div className="px-4 py-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Joined Users</h2>

                    <div className="space-y-4">
                      {
                        // {[
                        //   { name: 'name1', email: 'email1' },
                        //   { name: 'name2', email: 'email2' }
                        // ]
                        data.joinedUsers.length > 0 ? data.joinedUsers.map(({ name, email }: User, index) => (
                          <div key={index} className="flex flex-col">
                            <span className="font-semibold text-gray-900">{name}</span>
                            <span className="text-sm text-gray-600">{email}</span>
                          </div>
                        )) : "No users joined"
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
