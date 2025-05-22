import { TrashIcon } from '@heroicons/react/outline';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation } from 'react-query';
import { deleteAchievement } from '../api';
import { queryClient } from '@/lib/react-query';

type DeleteAchievementsGroupProps = {
  achievementId: string;
};

export const DeleteAchievementsGroup = ({ achievementId }: DeleteAchievementsGroupProps) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isSuccess, isLoading } = useMutation(deleteAchievement, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
      queryClient.invalidateQueries('get-achievementsgroups');
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title="Delete Achievements Group"
        body="Are you sure you want to delete this Achievements group?"
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
            Delete Achievements Group
          </Button>
        }
      />
    </Authorization>
  );
};
