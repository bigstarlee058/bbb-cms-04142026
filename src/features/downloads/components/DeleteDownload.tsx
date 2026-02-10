import { TrashIcon } from '@heroicons/react/outline';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation } from 'react-query';
import { deleteDownload } from '../api';
import { queryClient } from '@/lib/react-query';

type DeleteDownloadProps = {
  downloadId: string;
};

export const DeleteDownload = ({ downloadId }: DeleteDownloadProps) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isSuccess, isLoading } = useMutation(deleteDownload, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
      queryClient.invalidateQueries('get-downloads');
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title="Delete Download"
        body="Are you sure you want to delete this download?"
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
              await mutate(downloadId);
            }}
          >
            Delete Download
          </Button>
        }
      />
    </Authorization>
  );
};