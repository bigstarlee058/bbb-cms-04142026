import { TrashIcon } from '@heroicons/react/outline';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation } from 'react-query';
import { deleteChallenge } from '../api';
import { queryClient } from '@/lib/react-query';

type DeleteChallengeProps = {
  challengeId: string;
};

export const DeleteChallenge = ({ challengeId }: DeleteChallengeProps) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isSuccess, isLoading } = useMutation(deleteChallenge, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
      queryClient.invalidateQueries('get-challenges');
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title="Delete Challenge"
        body="Are you sure you want to delete this challenge?"
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />}></Button>
        }
        confirmButton={
          <Button
            isLoading={isLoading}
            type="button"
            className="bg-red-600"
            onClick={async () => {
              await mutate(challengeId);
            }}
          >
            Delete Challenge
          </Button>
        }
      />
    </Authorization>
  );
};
