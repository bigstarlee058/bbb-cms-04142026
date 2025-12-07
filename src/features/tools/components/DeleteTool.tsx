import { TrashIcon } from '@heroicons/react/outline';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation } from 'react-query';
import { deleteTool } from '../api';
import { queryClient } from '@/lib/react-query';

type DeleteToolProps = {
  id: string;
};

export const DeleteTool = ({ id }: DeleteToolProps) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isSuccess, isLoading } = useMutation(deleteTool, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
      queryClient.invalidateQueries('get-tools');
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title="Delete Tool"
        body="Are you sure you want to delete this tool?"
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
              await mutate(id);
            }}
          >
            Delete Tool
          </Button>
        }
      />
    </Authorization>
  );
};
