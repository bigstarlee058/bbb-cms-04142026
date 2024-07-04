import { TrashIcon } from '@heroicons/react/outline';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { useAuth } from '@/lib/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation } from 'react-query';
import { deleteUser } from '../api';
import { queryClient } from '@/lib/react-query';

type DeleteUserProps = {
  id: string;
};

export const DeleteUser = ({ id }: DeleteUserProps) => {
  const { user } = useAuth();
  const { addNotification } = useNotificationStore();

  const { mutate, isSuccess, isLoading } = useMutation(deleteUser, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
      queryClient.invalidateQueries('get-users');
    },
  });

  if (user?.uid === id) return null;

  return (
    <ConfirmationDialog
      icon="danger"
      title="Delete User"
      body="Are you sure you want to delete this user?"
      triggerButton={
        <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />}></Button>
      }
      confirmButton={
        <Button
          isLoading={isLoading}
          type="button"
          className="bg-red-600"
          onClick={() => mutate(id)}
        >
          Delete User
        </Button>
      }
    />
  );
};
