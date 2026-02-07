import { TrashIcon } from '@heroicons/react/outline';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation } from 'react-query';
import { deleteAchievement } from '../api';
import { queryClient } from '@/lib/react-query';

type DeleteAchievementsIndividualProps = {
  achievementId: string;
};

export const DeleteAchievementsIndividual = ({ achievementId }: DeleteAchievementsIndividualProps) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isSuccess, isLoading } = useMutation(deleteAchievement, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-achievements');
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
        title="Delete Achievement"
        body="Are you sure you want to delete this Achievement?"
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
              await mutate(achievementId);
            }}
          >
            Delete Achievement
          </Button>
        }
      />
    </Authorization>
  );
};
