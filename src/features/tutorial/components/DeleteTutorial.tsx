import { TrashIcon } from '@heroicons/react/outline';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation } from 'react-query';
import { deleteTutorial } from '../api';
import { queryClient } from '@/lib/react-query';

type DeleteTutorialProps = {
  tutorialId: string;
};

export const DeleteTutorial = ({ tutorialId }: DeleteTutorialProps) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isSuccess, isLoading } = useMutation(deleteTutorial, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-tutorials');
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title="Delete Tutorial"
        body="Are you sure you want to delete this tutorial?"
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
              await mutate(tutorialId);
            }}
          >
            Delete Tutorial
          </Button>
        }
      />
    </Authorization>
  );
};
