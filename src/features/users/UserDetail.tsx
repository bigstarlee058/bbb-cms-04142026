import { EyeIcon } from '@heroicons/react/outline';
import { Button, PopupDialog } from '@/components/Elements';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import { deleteUser } from './api';
import { queryClient } from '@/lib/react-query';
import { useQuery } from 'react-query';
import { fetchUser } from './api';
import { ErrorMessage } from '@/types';
import { UserWorkout } from '@/types';
import { Table } from '@/components/Elements';

type UserDetailProps = {
  id: string;
  // name: string;
  // email: string;
  // role: number;
  // createdAt: string;
  // updatedAt: string;
};

export const UserDetail = ({ id }: UserDetailProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  const { data, isLoading } = useQuery(['get-user', id], () => fetchUser(id), {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'error',
        title: err.message,
      });
      navigate('/app/users');
    },
  });

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }
  if (user?.uid === id) return null;
  return (
    <PopupDialog
      icon="info"
      name={data.name}
      email={data.email}
      triggerButton={
        <Button variant="danger" startIcon={<EyeIcon className="h-4 w-4" />}></Button>
      }
    />
  );
};
