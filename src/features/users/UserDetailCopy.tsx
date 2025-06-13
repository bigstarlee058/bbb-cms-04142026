import { useNavigate, useParams } from 'react-router-dom';
import { Spinner, MDPreview } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { formatDate } from '@/utils/format';
import { useQuery } from 'react-query';
import { fetchUser } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage } from '@/types';
import { User } from '@/types';
import { UserWorkout } from '@/types';
import { Table } from '@/components/Elements';
import Pagination from '@/components/Elements/Pagination';


export const UserDetail = () => {
  const { userId } = useParams();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['get-user', userId], () => fetchUser(userId), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'error',
        title: err.message,
      });
      navigate('/app/users');
    },
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
      <ContentLayout title={data.name}>
        <div className="mt-4 flex flex-col space-y-4">
          <div className="flex justify-start">
            <span>{data.email}</span>
          </div>
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              
              <Table<UserWorkout>
                data={data.workoutsHistory}
                columns={[
                  {
                    title: 'Day',
                    field: 'day',
                  },
                  {
                    title: 'Status',
                    field: 'daySplit',
                    Cell({ entry: { daySplit} }) {
                      return (daySplit === 0 ? <span className='text-red-800'>Not Completed</span> :
                    daySplit === 1 ? <span className='text-blue-800'>Skipped</span> : <span className='text-green-800'>Completed</span>)}
                  },
                  {
                    title: 'Exercises',
                    field: 'exercises',
                    Cell({ entry: { exercises } }) {
                      return <span>{exercises.map(exercise => {
                        return exercise.exerciseId;
                      })}</span>;
                    },
                  },
                  {
                    title: 'Total Reps',
                    field: 'exercises',
                    Cell({ entry: { exercises } }) {
                      return <span>{exercises.map(exercise => {
                        return exercise.exerciseId;
                      })}</span>;
                    },
                  },
                  {
                    title: 'Total Weight',
                    field: 'exercises',
                    Cell({ entry: { exercises } }) {
                      return <span>{exercises.map(exercise => {
                        return exercise.exerciseId;
                      })}</span>;
                    },
                  },
                  {
                    title: 'Analysis',
                    field: 'exercises',
                    Cell({ entry: { exercises } }) {
                      return <span>{exercises.map(exercise => {
                        return exercise.exerciseId;
                      })}</span>;
                    },
                  },

                ]}
              />
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
};
